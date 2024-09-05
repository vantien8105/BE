var multer = require('multer');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const uploadFile = require('../midleware/checkUploadFile.middleware')
const db = require('../config/connect_DB');
const fs = require('fs');

app.post('/login', async(req, res) =>{
  const username = req.body.user;
  const password = req.body.password;
  try{
      const result = await db.query('SELECT id, username, password FROM users WHEN username = ?', [username]);
      if(result.length === 0 ){
          return res.status(404).send({message: 'Invalid user'});
      }
      const user = result[0];

      const isMatch = await bcrypt.compare(password , user[0].password);
      if(!isMatch){
          return res.status(403).send({message: 'Password not correct'});
      }

      const token = jwt.sign({username: user[0].username} , JWT_SECRET, {expiresIn: '30m'});
      res.send(token);
  }
  catch(err){
      res.status(500).json({ error: err.message });
  }
});



// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })

app.post('/api/uploadfile', upload.single('file'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file');
    return next(error)
  }
  res.send('single file')
})

  //Uploading multiple files
app.post('/api/uploadmultiple', upload.array('file', 12), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send("Multiple file")
})

app.post('/api/uploadphoto', upload.single('picture'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

try{
  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString('base64');

  var finalImg = {
    contentType: req.file.mimetype,
    image: new Buffer(encode_image, 'base64')
  };
  res.status(200).send({message:'photo was saved server'})
}
catch (err){
  console.log(err);
  res.status(500).send({ message: 'Internal server error' });
}


});

module.exports = app;