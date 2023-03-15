import { StatusCodes } from 'http-status-codes';
import CustomAppError from './customAppError.js';

class NotFoundError extends CustomAppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.NOT_FOUND;
    this.status = 'fail';
  };
};

export default NotFoundError;
