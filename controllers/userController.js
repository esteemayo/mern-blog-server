const _ = require('lodash');

const User = require('../models/User');
const Post = require('../models/Post');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const createSendToken = (users, statusCode, res) => {
  const token = users.generateAuthToken();

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  res.cookie('jwt', token, cookieOption);

  const { password, ...user } = users._doc;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password || passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password updates. Please use update ${
          req.protocol
        }://${req.get('host')}/api/v1/users/update-my-password`,
        400
      )
    );
  }

  const filterBody = _.pick(req.body, ['name', 'username', 'email', 'avatar']);

  const user = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });

  createSendToken(user, 200, res);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  await Post.deleteMany({ username: user.username });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: 'fail',
    message: `This route is not defined! Please use ${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/signup instead`,
  });
};

exports.getAllUser = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
