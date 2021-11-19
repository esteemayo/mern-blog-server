const { StatusCodes } = require('http-status-codes');
const CustomAppError = require('./customAppError');

class ForbiddenError extends CustomAppError {
    constructor(message) {
        super(message);

        this.statusCode = StatusCodes.FORBIDDEN;
        this.status = 'fail';
    };
};

module.exports = ForbiddenError;
