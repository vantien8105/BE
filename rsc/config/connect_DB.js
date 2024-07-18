const { log } = require("console");
require('dotenv').config(); // Đọc biến môi trường từ file .env
const mysql = require('mysql2');


const conn = mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"08012005",
    database:"SGr",
}).promise();

conn.connect()
    .then(()=>{
        
    })

module.exports = conn;