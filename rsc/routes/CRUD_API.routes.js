var express = require("express");
var fs = require("fs");
var parser = require("body-parser");
var app = express();
const db = require("../config/connect_DB");

app.get('/api/user', async(req, res) => {
    const users = await db.query("SELECT * FROM users");
    res.json(users);
});

app.get('/api/user/:id', async (req, res) => {
    let id = req.params.id;

    try {
        // Sử dụng prepared statements để tránh SQL Injection
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

        if (user.length > 0) {
            res.json(user[0]); // Trả về đối tượng user
        } else {
            res.status(404).send({ message: "Item not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
});

app.post ('/api/user', async(req, res) =>{
    const newuser = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
    }

    try{
        // Sử dụng prepared statements để tránh SQL Injection
        await db.query('INSERT INTO users (name, username, password) VALUES (?, ?, ?)', 
            [newuser.name, newuser.username, newuser.password]);
        res.status(200).send({ message: "New user was added to database" });
    } 
    catch(err){
        console.log(err);
        res.status(500).send({ message: "Server error" });
    }  
});

app.put ('/api/user/:id', async (req, res) =>{
    let id = req.params.id;
    const user = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
    }
    try{
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ? ', [user.username]);

        if (existingUser.length > 0) {
            return res.status(409).send({ message: "Username already exists" });
        }
        
        await db.query('UPDATE users SET name = ?, username = ?, password = ? WHERE id = ?', 
            [user.name, user.username, user.password, id]);
        res.status(200).send({ message: "New user was updated to database" });
    } 
    catch(err){
        console.log(err);
        res.status(500).send({ message: "Server error" });
    } 
});

app.delete('/api/user/:id', async (req, res) => {
    let id = req.params.id;
    try{
        const [NotExistingUser] = await db.query('SELECT * FROM users WHERE id = ? ', [id]);
        console.log(NotExistingUser.length);
    if (NotExistingUser.length == 0) {
        return res.status(409).send({ message: "Username not already exists" });
    }
    
    await db.query(`DELETE FROM users where id = ${id}`);
    res.status(202).send({message: "User was deleted from database!"});

    }
    catch(err){
        console.log(err);
        res.status(500).send({ message: "Server error" });
    }
})
module.exports = app;