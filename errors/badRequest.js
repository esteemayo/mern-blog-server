const { StatusCodes } = require('http-status-codes');
const CustomAppError = require('./customAppError');

class BadRequestError extends CustomAppError {
    constructor(message) {
        super(message);

        this.statusCode = StatusCodes.BAD_REQUEST;
        this.status = 'fail';
    };
};

module.exports = BadRequestError;
