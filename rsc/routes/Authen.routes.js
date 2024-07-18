const express = require('express');
const bcrypt = require('bcrypt');
// thư viện bcrypt giúp chúng ta hash pass, salt, compare hash password - pass login. 
const jwt = require('jsonwebtoken');
const db = require('../config/connect_DB');
const router = express.Router();
const validateToken = require('../midleware/Authen.middleware')
const JWT_SECRET = process.env.JWT_SECRET;




// register
router.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {

        const hashedPassword = await bcrypt.hash(password, 10); // số 10 ý nghĩa là hàm băm sẽ băm 2^10 lần. càng băm nhiều thì bảo mặt càng cao nma tg thực thi càng lớn

        const result = await db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );
        res.status(201).json({ id: result.insertId, username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




// Login
router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    try {
        const results = await db.query('SELECT id, username, password FROM users WHERE username = ?', [username]);
        console.log(results);
        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user[0].password);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30m' });
        res.send(token);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "error from server" });
    }
});


router.get('/api/getUser', validateToken , async (req, res) =>{
    const AllUsers = await db.query('SELECT * FROM users');
    res.status(200).json(AllUsers[0]);
} )

module.exports = router;
