// const crypto = require('crypto');

const {
  successResponse,
  errorResponse,
  generateJWTtoken,
} = require('../../../helpers/helpers');
const { verifyGoogleToken } = require('../../../helpers/signup');

const { successMessages, errorMessages } = require('../../../helpers/messages');
const { Users } = require('../../../model/users');

exports.signup = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return errorResponse(req, res, errorMessages.INVALID_CREDENTIALS, 400);

    let userAuth = await verifyGoogleToken(credential);
    if (userAuth.error || !userAuth.payload) {
      return errorResponse(req, res, userAuth.error || errorMessages.INVALID_CREDENTIALS, 400);
    }
    userAuth = userAuth?.payload;

    let token;
    let user = await Users.findOne({ email: userAuth.email });

    if (user && user.googleAuth === userAuth.sub) {
      token = generateJWTtoken({ id: user.id, email: user.email });
    } else {
      const payload = {
        email: userAuth.email,
        firstName: userAuth.given_name,
        lastName: userAuth.family_name,
        picture: userAuth.picture,
        googleAuth: userAuth.sub,
      };

      user = await Users.create(payload);
      token = generateJWTtoken({ id: user.id, email: user.email });
    }
    const trimmedRes = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        email: user.email,
        id: user._id,
        is2FA: user.is2FA,
        role: user.role,
      },
      token,
    };
    return successResponse(req, res, trimmedRes, successMessages.OPERATION_COMPLETED, 201);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return errorResponse(req, res, errorMessages.INVALID_CREDENTIALS, 400);

    let userAuth = await verifyGoogleToken(credential);
    if (userAuth.error || !userAuth.payload) {
      return errorResponse(req, res, userAuth.error || errorMessages.INVALID_CREDENTIALS, 400);
    }
    userAuth = userAuth?.payload;

    let token;
    const user = await Users.findOne({ email: userAuth.email });

    if (user && user.googleAuth === userAuth.sub) {
      token = generateJWTtoken({ id: user.id, email: user.email });
    } else {
      return errorResponse(req, res, errorMessages.USER_NOT_EXIST, 400);
    }
    const trimmedRes = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        email: user.email,
        id: user._id,
        is2FA: user.is2FA,
        role: user.role,
      },
      token,
    };
    return successResponse(req, res, trimmedRes, successMessages.OPERATION_COMPLETED, 201);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    return successResponse(req, res, {}, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
