import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

import User from '../models/User.js';
import Post from '../models/Post.js';
import factory from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import BadRequestError from '../errors/badRequest.js';

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

export const updateMe = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password || passwordConfirm) {
    return next(
      new BadRequestError(
        `This route is not for password updates. Please use update ${req.protocol
        }://${req.get('host')}/api/v1/users/update-my-password`
      )
    );
  }

  const filterBody = _.pick(req.body, ['name', 'username', 'email', 'avatar']);

  const user = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });

  createSendToken(user, StatusCodes.OK, res);
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  await Post.deleteMany({ username: user.username });

  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const createUser = (req, res, next) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'fail',
    message: `This route is not defined! Please use ${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/signup instead`,
  });
};

export const getAllUser = factory.getAll(User);
export const getUser = factory.getOneById(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
