const { JsonWebTokenError } = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');

module.exports = function(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server Error';


    if(process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        });
    }
    if(process.env.NODE_ENV === 'PRODUCTION'){
        let error = {...err}

        error.message = err.message;

        // Wrong mongoose object id error
        if(err.name === 'CastError') {
            const message = `Resource not found. Invalid ID: ${err.path}`;
            err = new ErrorHandler(message, 400);
        }

        // Handling mongoose validation error
        if(err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(value => value.message);
            err = new ErrorHandler(message, 400);
        }


        //handelimg Mongood duplication error
        if(err.code === 11000){
            const message = `duplicate ${Object.keys(err.keyvalue)} entered`
            error = new ErrorHandler(message, 400);
        }

        //handling wrong JWT error
        if(err.name === 'JsonWebTokenError'){
            const message = 'JSON WEB token is expired'
            error = new ErrorHandler(message, 400);
        }

        //handling expired JWT error
        if(err.name === 'TokenExpiredError'){
            const message = 'JSON WEB token is invalid. try again later'
            error = new ErrorHandler(message, 400);
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
   
}
