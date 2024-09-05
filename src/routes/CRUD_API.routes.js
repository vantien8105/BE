const express = require("express");
const app = express();
const db = require("../config/connect_DB");
const bcrypt = require("bcrypt")
app.get('/api/user', async(req, res) => {
    try{
        const users = await db.query("SELECT id, username FROM users");
        console.log(users[0].length);
        if(users[0].length == 0){
            return res.status(201).send({message:"Don't have any users on database"});
        }
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
});

app.get('/api/user/:id', async (req, res) => {
    let id = req.params.id;

    try {
        // Dung prepared statements de tranh SQL Injection
        const [user] = await db.query('SELECT id, username FROM users WHERE id = ?', [id]);

        if (user.length > 0) {
            res.status(200).json(user[0]);
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
        username: req.body.username,
        password: req.body.password,
    }

    try{
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ? ', [newuser.username]);

        if (existingUser.length > 0) {
            return res.status(409).send({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(newuser.password, 10); 
        await db.query('INSERT INTO users ( username, password) VALUES ( ?, ?)', 
            [newuser.username, hashedPassword]);
        res.status(200).send({ message: "New user was added to database" });
    } 
    catch(err){
        console.log(err);
        res.status(500).send({ message: "Server error" });
    }  
});

app.put ('/api/user/:id', async (req, res) =>{
    const id = req.params.id;
    const user = {
        username: req.body.username,
        password: req.body.password,
    }
    try{
        const [existingUser] = await db.query('SELECT username FROM users WHERE username = ? and id != ? ', [user.username, id]);
        console.log(existingUser.length);
        
        if (existingUser.length > 0) {
            return res.status(409).send({ message: "Username already exists" });
        }
        
        await db.query('UPDATE users SET username = ?, password = ? WHERE id = ?', 
            [ user.username, user.password, id]);
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
    
    await db.query(`DELETE FROM users where id = ?`, [id]);
    res.status(200).send({message: "User was deleted from database!"});

    }
    catch(err){
        console.log(err);
        res.status(500).send({ message: "Server error" });
    }
})
module.exports = app;