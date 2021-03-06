const _ = require('lodash');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const sendMail = require('../utils/sendMail');
const catchAsync = require('../utils/catchAsync');
const NotFoundError = require('../errors/notFound');
const ForbiddenError = require('../errors/forbidden');
const BadRequestError = require('../errors/badRequest');
const CustomAppError = require('../errors/customAppError');
const UnauthenticatedError = require('../errors/unauthenticated');

const createSendToken = (users, statusCode, res) => {
  const token = users.generateAuthToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  const { password, ...user } = users._doc;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const userData = _.pick(req.body, ['name', 'role', 'email', 'username', 'password', 'passwordConfirm', 'passwordChangedAt']);

  const user = await User.create({ ...userData });

  createSendToken(user, StatusCodes.CREATED, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new BadRequestError('Please provide email and password'));
  }

  const user = await User.findOne({ username: username }).select('+password');

  if (!user || !(await user.correctPassword(password))) {
    return next(new UnauthenticatedError('Incorrect email or password'));
  }

  createSendToken(user, StatusCodes.OK, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(
      new UnauthenticatedError('You are not logged in! Please log in to get access.')
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id).select('-password');

  if (!currentUser) {
    return next(
      new UnauthenticatedError(
        'The user belonging to this token does no longer exist.'
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new UnauthenticatedError('User recently changed password! Please log in again.')
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new NotFoundError('There is no user with email address'));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `
    Hi ${user.name},
    There was a request to change your password!
    If you did not make this request then please ignore this email.
    Otherwise, please click this link to change your password: ${resetURL}
  `;

  const html = `
    <div style='background: #f7f7f7; color: #333; padding: 50px; text-align: left;'>
        <h3>Hi ${user.name},</h3>
        <p>There was a request to change your password!</p>
        <p>If you did not make this request then please ignore this email.</p>
        <p>Otherwise, please click this link to change your password: 
            <a href='${resetURL}'>Reset my password ???</a>
        </p>
    </div>
  `;

  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (valid for only 10 mins)',
      message,
      html,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Token sent to email.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new CustomAppError(
        'There was an error sending the email. Try again later.'
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new BadRequestError('Token is invalid or has expired.'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, StatusCodes.OK, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent))) {
    return next(new UnauthenticatedError('Your current password is wrong.'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, StatusCodes.OK, res);
});
