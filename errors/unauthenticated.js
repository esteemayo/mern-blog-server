const { StatusCodes } = require('http-status-codes');
const CustomAppError = require('./customAppError');

class UnauthenticatedError extends CustomAppError {
    constructor(message) {
        super(message);

        this.statusCode = StatusCodes.UNAUTHORIZED;
        this.status = 'fail';
    };
};

module.exports = UnauthenticatedError;
