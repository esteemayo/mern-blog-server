import { StatusCodes } from 'http-status-codes';
import CustomAppError from './customAppError.js';

class UnauthenticatedError extends CustomAppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.status = 'fail';
  };
};

export default UnauthenticatedError;
