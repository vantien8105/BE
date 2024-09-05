const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

const Auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401);
    }
    console.log(token);
    
    jwt.verify(token, JWT_SECRET, (err, user) =>{
        if(err){
            return res.status(403).send({error:"Token invalid"});
        }

        req.user = user; //sau khi xac thuc thanh cong thi luu thong tin user vao req de middleware và route

        next();
    })
}

module.exports = Auth;