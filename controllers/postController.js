import { StatusCodes } from 'http-status-codes';

const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const NotFoundError = require('../errors/notFound');
const ForbiddenError = require('../errors/forbidden');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const posts = await features.query;

  res.status(StatusCodes.OK).json({
    status: 'success',
    results: posts.length,
    requestedAt: req.requestTime,
    posts,
  });
});

exports.getPostById = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new NotFoundError('No post found with that ID'));
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    post,
  });
});

exports.getPostBySlug = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.slug });

  if (!post) {
    return next(new NotFoundError('No post found with that ID'));
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    post,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  if (!req.body.username) req.body.username = req.user.username;
  const post = await Post.create({ ...req.body });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new NotFoundError('No post found with that ID'));
  }

  if (post.username === req.user.username) {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        updatedPost,
      },
    });
  }

  return next(new ForbiddenError('You can only update your post'));
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new NotFoundError('No post found with that ID'));
  }

  if (post.username === req.user.username) {
    await Post.findByIdAndDelete(req.params.id);

    return res.status(StatusCodes.NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  }

  return next(new ForbiddenError('You can only delete your post'));
});
