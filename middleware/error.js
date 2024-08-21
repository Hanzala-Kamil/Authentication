const ErrorHandler = require('../utils/errorHander')

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong Mongodb Id Error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ErrorHandler(message, 400)
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandler(message, 400)
    }

    // wrong JWT Error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Json Web Token is invalid, please log in again'
        err = new ErrorHandler(message, 400)
    }

    // JWT Expire Error 
    if (err.name === 'TokenExpiredError') {
        const message = 'Json Web Token has expired, please log in again'
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        error: err.message,
    });
};