const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const  crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a username'],
        maxlength: 30
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Your password must be at least 6 characters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});


// encripting password beforte saving user
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

//compare password

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


// return JSON tokens
UserSchema.methods.getJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

//generate password reset token

UserSchema.methods.getResetPasswordToken = function() {
    
    //generate a token 
    const resetToken = crypto.randomBytes(20).toString('hex');
    //HAS ABD SET TO RESETPASSWORDTOKEN
    this.resetPasswordToken = crypto
     .createHash('sha256')
     .update(resetToken)
     .digest('hex');

    this.resetPasswordExpire = Date.now() + 3600000;

    return resetToken;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
