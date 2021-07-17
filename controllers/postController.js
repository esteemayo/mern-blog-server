const Post = require('../models/Post');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const posts = await features.query;

  res.status(200).json({
    status: 'success',
    results: posts.length,
    requestedAt: req.requestTime,
    posts,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 400));
  }

  res.status(200).json({
    status: 'success',
    post,
  });
});

exports.getPostWithSlug = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.slug });

  if (!post) {
    return next(new AppError('No post found with that ID', 400));
  }

  res.status(200).json({
    status: 'success',
    post,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  if (!req.body.username) req.body.username = req.user.username;
  const post = await Post.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  if (post.username === req.user.username) {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        updatedPost,
      },
    });
  }

  return next(new AppError('You can only update your post', 401));
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  if (post.username === req.user.username) {
    await Post.findByIdAndDelete(req.params.id);

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }

  return next(new AppError('You can only delete your post', 401));
});
