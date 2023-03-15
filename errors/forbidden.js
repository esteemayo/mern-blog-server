import { StatusCodes } from 'http-status-codes';
import CustomAppError from './customAppError.js';

class ForbiddenError extends CustomAppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.FORBIDDEN;
    this.status = 'fail';
  };
};

export default ForbiddenError;
