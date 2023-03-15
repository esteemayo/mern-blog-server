import { StatusCodes } from 'http-status-codes';

import Post from '../models/Post.js';
import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import ForbiddenError from '../errors/forbidden.js';
import NotFoundError from '../errors/notFound.js';

export const getAllPosts = catchAsync(async (req, res, next) => {
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

export const getPostById = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return next(
      new NotFoundError(`No post found with that ID → ${postId}`)
    );
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    post,
  });
});

export const getPostBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug });

  if (!post) {
    return next(
      new NotFoundError(`No post found with that SLUG → ${slug}`)
    );
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    post,
  });
});

export const createPost = catchAsync(async (req, res, next) => {
  if (!req.body.username) req.body.username = req.user.username;

  const post = await Post.create({ ...req.body });

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    post,
  });
});

export const updatePost = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return next(
      new NotFoundError(`No post found with that ID → ${postId}`)
    );
  }

  if (post.username === req.user.username) {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { ...req.body } },
      {
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

export const deletePost = catchAsync(async (req, res, next) => {
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
