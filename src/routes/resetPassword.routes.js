const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/connect_DB'); 
const reset_PW = express.Router();
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateOtp = (length) => {
  const otp = crypto.randomInt(0, Math.pow(10, length)).toString();
  return otp.padStart(length, '0');
};

const sendOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'arnold84@ethereal.email',
        pass: 'h6ZY5JQG9uJQZkFCGf'
    }
});

  const mailOptions = {
    from: 'sarnold84@ethereal.email',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


reset_PW.post('/sendOTP', async (req, res) => {
  const email = req.body.email;
  console.log(email);
  try {
    const [rows] = await db.query('SELECT email FROM list WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).send({ message: 'Email not exist!' });
    }

    const otp = generateOtp(6);
    await sendOtp(email, otp);;

    const date = new Date(Date.now() + 10 * 60 * 1000);
    console.log(date);
    await db.query('UPDATE list SET passwordResetOTP = ? , OTPExpiration = ? WHERE email = ? ', [otp, date, email]);
    res.send({ message: 'OTP sent!' });

  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

reset_PW.post('/newPW', async(req , res) =>{
  const email = req.body.email;
  const OTPToken = req.body.OTPToken;
  const newPassword = req.body.newPassword;

  try {
    const [user] = await db.query('SELECT * FROM list WHERE email = ? AND passwordResetOTP = ? AND OTPExpiration >= ?', 
      [email, OTPToken, new Date(Date.now())]);
    console.log(user);
    if(user.length === 0){
    return res.status(400).send({message: 'Invalid OTP code or time expire, try again'})
    } else {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await db.query('UPDATE list SET password = ? , passwordResetOTP = NULL, OTPExpiration = NULL WHERE email =?', [hashedPassword, email]);
    res.status(200).send({message: 'Password has changed!'})
}
  }
  catch(err){
    res.status(500).send({message:'Error from DB'});
    console.log(err);
  }
})

module.exports = reset_PW;
