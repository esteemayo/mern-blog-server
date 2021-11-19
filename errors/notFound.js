const { StatusCodes } = require('http-status-codes');
const CustomAppError = require('./customAppError');

class NotFoundError extends CustomAppError {
    constructor(message) {
        super(message);

        this.statusCode = StatusCodes.NOT_FOUND;
        this.status = 'fail';
    };
};

module.exports = NotFoundError;
