const jwt = require('jsonwebtoken');
const { envConstants } = require('../helpers/constants');

const {
  errorResponse,
} = require('../helpers/helpers');

const { errorMessages } = require('../helpers/messages');

const { Users } = require('../model/users');

exports.authentication = async (req, res, next) => {
  let decoded;

  console.log(req.headers.authorization);
  if (!(req.headers && req.headers.authorization) && !(req.cookies && req.cookies.token)) {
    console.log('how are you here?');
    return errorResponse(req, res, errorMessages.NO_TOKEN_PROVIDED, 401);
  }

  const token = req.headers.authorization || req.cookies.token;

  try {
    decoded = jwt.verify(token, envConstants.JWT_SECRET);
  } catch (error) {
    console.log(error);
    if (error.message === 'jwt expired') {
      return errorResponse(req, res, errorMessages.TOKEN_EXPIRED, 401);
    }
    return errorResponse(req, res, error.message, 401);
  }

  let data;
  try {
    console.log(decoded);
    data = await Users.findOne({ _id: decoded.id });
    if (!data) return errorResponse(req, res, errorMessages.USER_NOT_EXIST, 401);

    req.user = data;

    res.locals.ROLE = data.role;
    res.locals.METHOD = req.method;
    res.locals.URL = req.url;
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 401);
  }
  return next();
};

exports.authorization = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return errorResponse(req, res, errorMessages.UNAUTHORIZED, 403);
  }
  return next();
}
