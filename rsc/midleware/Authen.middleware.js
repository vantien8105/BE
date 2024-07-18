const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

const Autho = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401);
    }
    console.log(token);
    
    jwt.verify(token, JWT_SECRET, (err, user) =>{
        if(err){
            return res.status(403).send({error:"Token deo ok"});
        }

        req.user = user; //sau khi xac thuc thanh cong thi luu thong tin user vao req de middleware và route để xử lý tiếp theo với thông tin người dùng đã xác thực.

        next();
    })
}

module.exports = Autho;