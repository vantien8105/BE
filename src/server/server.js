var express = require("express");
var fs = require("fs");
var parser = require("body-parser");
var app = express();
const db = require("../config/connect_DB");
require('dotenv').config();


const crud_API = require('../routes/CRUD_API.routes')
const auth = require('../routes/Authen.routes')
const resetPassword = require('../routes/resetPassword.routes')
const upload = require('../routes/uploadFile.routes')
const poll = require('../routes/Poll.routes')

app.use(parser.json());
app.use('/', crud_API);
app.use('/', auth);
app.use('/api', resetPassword);
app.use('/', upload);
app.use('/api', poll);
app.listen(3000, () => console.log("http://localhost:3000"));