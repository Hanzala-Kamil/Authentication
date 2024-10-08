const ErrorHander = require('../utils/errorHander');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Register a User

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'this is a sample id',
            url: 'profilePicUrl'
        }
    });
    sendToken(user, 201, res)
})

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    // Checking if user has given password and email
    if (!email || !password) {
        return next(new ErrorHander('Please Enter Email & Password', 400))
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorHander('Invalid Email or Password', 401))
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHander('Invalid Email or Password', 401))
    }
    sendToken(user, 200, res)
})

// LOGOUT USER
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'Logged Out'
    })
})

// forget Password
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHander('User Does Not Exist', 404))
    }
    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create ResetPassword URL
    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`
    const message = `Your password reset token is : - \n\n ${resetPasswordUrl} \n
        If you have not requested this email then, please ignore it.`;
    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHander(error.message, 500))
    }
})

// reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Get user hash
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        return next(new ErrorHander('Reset token password is invalid or Expired', 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander('Password does not match', 400));
    };
    // If token is valid, create new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res)
})

// Get user datails
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    })
})

// update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')
    // Check if old password is correct
    const isPasswordMatched = await bcrypt.compare(req.body.oldPassword, user.password)
    if (!isPasswordMatched) {
        return next(new ErrorHander('Old password is incorrect', 400))
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander('Password does not match', 400))
    }
    user.password = req.body.newPassword;
    await user.save()

    sendToken(user, 200, res);
})


// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };
    // we will add couldainry lated

    const user = await User.findByIdAndUpdate(req.body.id, newUserData, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        success: true
    });
});

// Get all users (admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
})

// Get single users (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHander(`user does not exist with id: ${req.params.id}`, 404))
    }
    res.status(200).json({
        success: true,
        user
    })
})


// update User Role --Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        success: true
    });
});


// delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHander(`user does not exist with id: ${req.params.id}`, 404));
    }
    await user.deleteOne({ _id: req.params.id });

    // we will remove couldainry lated

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});