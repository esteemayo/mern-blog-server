import { StatusCodes } from 'http-status-codes';

class CustomAppError extends Error {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    this.status = 'error';
  };
};

export default CustomAppError;
