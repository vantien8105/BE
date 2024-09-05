const { log } = require("console");
require('dotenv').config(); 
const mysql = require('mysql2');


const db = mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"08012005",
    database:"SGr",
}).promise();

// conn.connect()
//     .then(()=>{   
//     })

module.exports = db;