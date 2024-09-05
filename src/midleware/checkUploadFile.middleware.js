const express = require('express');
const jwt = require('jsonwebtoken');

const CheckSingleFile = (req,res,next) =>{
    const file = req.file
    if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error);
    }
  next();
  res.send(file);
  
};

const CheckMutipleFile =(res, req, next)  =>{
    const files = req.files
    if (!files) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
    res.send(files);
    next();
}




module.exports = CheckSingleFile;

module.exports = CheckMutipleFile;
