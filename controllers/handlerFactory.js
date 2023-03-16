import { StatusCodes } from 'http-status-codes';

import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';
import NotFoundError from '../errors/notFound.js';

export const getAll = (Model) =>
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

export const getOneById = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findById(docId);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID → ${docId}`)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      doc,
    });
  });

export const getOneBySlug = (Model) =>
  catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const doc = await Model.findOne({ slug });

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that SLUG → ${slug}`)
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      doc,
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      doc,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id: docId } = req.params;

    const doc = await Model.findByIdAndUpdate(
      docId,
      { $set: { ...req.body } },
      {
        new: true,
        runValidators: true,
      });

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID → ${docId}`)
      );
    }

    return res.status(StatusCodes.OK).json({
      status: 'success',
      doc,
    });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id: docId } = req.params.id;

    const doc = await Model.findByIdAndDelete(docId);

    if (!doc) {
      return next(
        new NotFoundError(`No document found with that ID → ${docId}`)
      );
    }

    return res.status(StatusCodes.NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  });
