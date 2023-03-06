/* eslint-disable no-unused-vars */

const { errorResponse } = require('../helpers/helpers');

const routeErrorHandler = (req, res, next) => {
  // This middleware throws an error, so Express will go straight to
  // the next error handler
  setImmediate(() => {
    next(new Error('Woops! route not found...'));
  });
};

const errorHandler = (err, req, res, next) => {
  // Any request to this server will get here, and will send an HTTP
  // response with the error message 'woops'
  // res.status(error.status || 500);
  if (typeof err === 'string') {
    // custom application error
    return errorResponse(req, res, err.message, 400);
  }

  if (err.message && err.status) {
    return errorResponse(req, res, err.message, err.status);
  }

  if (err.name === 'UnauthorizedError' || err.name === 'TokenExpiredError') {
    // jwt authentication error
    return errorResponse(req, res, 'Invalid Token', 401);
  }

  // default to 500 server error
  return errorResponse(req, res, err.message, 500);
};

module.exports = {
  routeErrorHandler,
  errorHandler,
};
