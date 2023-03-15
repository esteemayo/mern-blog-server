import { StatusCodes } from 'http-status-codes';
import CustomAppError from './customAppError.js';

class BadRequestError extends CustomAppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.BAD_REQUEST;
    this.status = 'fail';
  };
};

export default BadRequestError;
