import { StatusCodes } from 'http-status-codes';

import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';
import NotFoundError from '../errors/notFound.js';

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const posts = await features.query.explain();
    const docs = await features.query;

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: docs.length,
      requestedAt: req.requestTime,
      docs,
    });
  });

exports.getOneById = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new NotFoundError('No document found with that ID'));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getOneBySlug = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOne({ slug: req.params.slug });

    if (!doc) {
      return next(new NotFoundError('No document found with that SLUG'));
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new NotFoundError('No document found with that ID'));
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new NotFoundError('No document found with that ID'));
    }

    return res.status(StatusCodes.NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  });
