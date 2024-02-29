const express = require('express');
const router = express.Router();


const {
    registerUser,
    loginUser,
    logout,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword,
    updateUserProfile,
    allusers,
    getUserDetails,
    updateUser,
    deleteUser
} = require('../controller/authController');


const {isAuthenticatedUser,authorizeRoles} = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);


router.get('/logout', logout);
router.get('/me', isAuthenticatedUser,getUserProfile);
router.put('/password/update', isAuthenticatedUser,updatePassword);
router.put('/me/update', isAuthenticatedUser,updateUserProfile);


router.get('/admin/users', isAuthenticatedUser,authorizeRoles('admin'),allusers);
router
.get('/admin/users/:id', isAuthenticatedUser,authorizeRoles('admin'),getUserDetails)
.put('/admin/users/:id', isAuthenticatedUser,authorizeRoles('admin'),updateUser)
.delete('/admin/users/:id', isAuthenticatedUser,authorizeRoles('admin'),deleteUser);



module.exports = router;


