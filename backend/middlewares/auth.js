const User = require('../models/user');


const ErrorHandlar = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");

//checeks of the user is aithenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next)=>{
    const { token } = req.cookies
    
    if(!token) {
        return next(new ErrorHandlar('Logint to access this resource', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id);

    next()
})

//handling user roles
exports.authorizeRoles = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandlar('You are not authorized to access this resource', 401))
        }
        next()
    }
}