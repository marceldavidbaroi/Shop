const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const User = require('../models/user');
const ErrorHandlar = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const error = require('../middlewares/errors');
const sendEmail = require('../utils/sendEmail');
const { Error } = require('mongoose');
const crypto = require('crypto');


//register a user => /api/v1/register
exports.registerUser =  catchAsyncErrors(async(req, res, next) =>{
    const {name, email,password} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'user123',
            url: 'https://example.com/user123/avatar'
        }
    })

   sendToken(user, 200,res )

})


//login User => /api/v1/login
exports.loginUser = catchAsyncErrors(async(req,res,next) => {
    const {email, password} = req.body;

    //checks if this email and password is entered bu user

    if(!email || !password){
        return next(new ErrorHandlar('Please provide an email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');


    if(!user){
        return next(new ErrorHandlar('User not found', 401));
    }
    //check if password is correct or not 
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandlar('Incorrect password', 401));
    }

    sendToken(user, 200,res )

})


//forgotPassword =>/api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next(new ErrorHandlar('User not found with this email', 404));
    }

    //get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });


    //create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `your password reset tokent is as follow:\n\n${resetUrl}\n\n if you have not reqiested this , then ignore it.`
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `we have e-mailed your password reset link! ${user.email}`
        })

    }catch{
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandlar(error.message, 500));
    }
})


//reset Password =>/api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    }); 

    if(!user){
        return next(new ErrorHandlar('Password reset token is invalid or has expired', 400));
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandlar('Passwords do not match', 400));
    }

    //setup new password
 
    user.password =  req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user,200,res)
})


//get current logged in user details =>/api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id); 
    res.status(200).json({
        success: true,
        user
    })
} )

//update / change password =>/api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //check prvious user password
    const isMathched = await user.comparePassword(req.body.oldPassword)
        if(!isMathched){
            return next(new ErrorHandlar('Old password is incorrect',400))

        }
    user.password = req.body.password;
    await user.save();

    sendToken(user,200,res);
         
})

//update user profile =>/api/v1/me/update
exports.updateUserProfile = catchAsyncErrors(async (req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    //update avatar: later 

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
        
    })
})


//logout user =>/api/v1/logout
exports.logout = catchAsyncErrors(async(req,res,next) =>{
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Successfully logged out'
    })
})


//admin routes
//get all users =>/api/v1/admin/users
exports.allusers = catchAsyncErrors(async(req, res, next) =>{
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
})

//get user details =>/api/v1/asmin/user/:id
exports.getUserDetails = catchAsyncErrors(async(req, res, next) =>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandlar('User not found', 404));
    }
    res.status(200).json({
        success: true,
        user
    })
})


//update user profile =>/api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }


    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
        
    })
})



//delete user =>/api/v1/asmin/user/:id
exports.deleteUser = catchAsyncErrors(async(req, res, next) =>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandlar('User not found', 404));
    }

    //remove avatar from cloudinary -TODO
    await user.remove();

    res.status(200).json({
        success: true,
        
    })
})
