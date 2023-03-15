import _ from 'lodash';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { promisify } from 'util';

import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import sendMail from '../utils/sendMail.js';
import ForbiddenError from '../errors/forbidden.js';
import NotFoundError from '../errors/notFound.js';
import CustomAppError from '../errors/customAppError.js';
import BadRequestError from '../errors/badRequest.js';
import UnauthenticatedError from '../errors/unauthenticated.js';
import createSendToken from '../utils/createSendToken.js';

export const signup = catchAsync(async (req, res, next) => {
  const userData = _.pick(
    req.body,
    [
      'name',
      'role',
      'email',
      'username',
      'password',
      'passwordConfirm',
      'passwordChangedAt'
    ]
  );

  const user = await User.create({ ...userData });

  if (user) {
    createSendToken(user, StatusCodes.CREATED, req, res);
  }
});

export const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new BadRequestError('Please provide email and password'));
  }

  const user = await User.findOne({ username: username }).select('+password');

  if (!user || !(await user.correctPassword(password))) {
    return next(new UnauthenticatedError('Incorrect email or password'));
  }

  createSendToken(user, StatusCodes.OK, req, res);
});

export const protect = catchAsync(async (req, res, next) => {
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

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

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
            <a href='${resetURL}'>Reset my password →</a>
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

export const resetPassword = catchAsync(async (req, res, next) => {
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

  createSendToken(user, StatusCodes.OK, req, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, passwordCurrent } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(passwordCurrent))) {
    return next(new UnauthenticatedError('Your current password is wrong.'));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(user, StatusCodes.OK, res);
});
