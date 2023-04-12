// const crypto = require('crypto');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const {
  successResponse,
  errorResponse,
  generateJWTtoken,
} = require('../../../helpers/helpers');
const { verifyGoogleToken } = require('../../../helpers/signup');

const { successMessages, errorMessages } = require('../../../helpers/messages');
const { actionLog } = require('../../../helpers/dbOperation');
const { Users } = require('../../../model/users');
const { ServiceProviders } = require('../../../model/serviceProviders');
const { UserLogs } = require('../../../model/userLogs');
const { sendEmail } = require('../../../helpers/sendEmail');

exports.signup = async (req, res) => {
  try {
    const { credential, role } = req.body;
    console.log(credential, role);
    if (!credential) return errorResponse(req, res, errorMessages.INVALID_CREDENTIALS, 400);

    let userAuth = await verifyGoogleToken(credential);
    if (userAuth.error || !userAuth.payload) {
      return errorResponse(req, res, userAuth.error || errorMessages.INVALID_CREDENTIALS, 400);
    }
    userAuth = userAuth?.payload;

    let token;
    let user = await Users.findOne({ email: userAuth.email });
    console.log(userAuth);

    if (user && user.googleAuth === userAuth.sub) {
      if (user.role !== role.toLowerCase()) return errorResponse(req, res, errorMessages.INVALID_CREDENTIALS, 400);
      token = generateJWTtoken({ id: user.id, email: user.email });
      user.googleAuth = userAuth.sub;
      await user.save();
    } else {
      const payload = {
        email: userAuth.email,
        firstName: userAuth.given_name,
        lastName: userAuth.family_name,
        picture: userAuth.picture,
        googleAuth: userAuth.sub,
        role: role.toLowerCase(),
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
        _id: user._id,
        is2FA: user.is2FA,
        role: user.role,
      },
      token,
    };
    actionLog(user._id, user.role, 'signup');
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 9000000,
    });
    return successResponse(req, res, trimmedRes, successMessages.OPERATION_COMPLETED, 201);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    console.log(' login called');
    const { credential } = req.body;
    console.log(credential);
    if (!credential) return errorResponse(req, res, errorMessages.INVALID_CREDENTIALS, 400);

    let userAuth = await verifyGoogleToken(credential);
    if (userAuth.error || !userAuth.payload) {
      return errorResponse(req, res, userAuth.error || errorMessages.INVALID_CREDENTIALS, 400);
    }
    userAuth = userAuth?.payload;

    let token;
    const user = await Users.findOne({ email: userAuth.email });

    if (user && user.role === 'admin') {
      token = generateJWTtoken({ id: user.id, email: user.email });
      user.googleAuth = userAuth.sub;
      user.firstName = userAuth.given_name;
      user.lastName = userAuth.family_name;
      user.picture = userAuth.picture;

      await user.save();
    } else if (user && user.googleAuth === userAuth.sub) {
      token = generateJWTtoken({ id: user.id, email: user.email });
      user.googleAuth = userAuth.sub;
      await user.save();
    } else {
      return errorResponse(req, res, errorMessages.USER_NOT_EXIST, 400);
    }
    const trimmedRes = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        email: user.email,
        _id: user._id,
        is2FA: user.is2FA,
        role: user.role,
      },
      token,
    };
    actionLog(user._id, user.role, 'Login');
    res.header('Access-Control-Allow-Credentials', true);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 9000000,
    });
    return successResponse(req, res, trimmedRes, successMessages.OPERATION_COMPLETED, 201);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');

    actionLog(req.user._id, req.user.role, 'logout');
    return successResponse(req, res, {}, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      about,
      experiance,
      gender,
      email,
    } = req.body;
    const { user } = req;

    if (email) {
      let isEmailExist;
      try {
        isEmailExist = await Users.findOne(
          { email: email.toLowerCase(), _id: { $ne: user._id } },
        );
        if (isEmailExist) {
          return errorResponse(req, res, errorMessages.EMAIL_ALREADY_EXIST, 400);
        }
      } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
      }
    }

    const updatedUser = await Users.findByIdAndUpdate(
      user._id,
      {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        about: about || user.about,
        gender: gender || user.gender,
        experiance: experiance || user.experiance,
      },
      { new: true },
    );

    console.log('BODY  ', req.body);
    const payload = {
      technologies: req.body.technology,
      languages: req.body.language,
      libsAndPackages: req.body.libsAndPackage,
      frameworks: req.body.framework,
      databases: req.body.database,
      projects: [
        {
          title: req.body['project-title'],
          description: req.body['project-details'],
        },
      ],
      experience: [
        {
          company: req.body['org-title'],
          position: req.body['org-job-post'],
          description: req.body['org-description'],
          startDate: req.body['org-job-start'],
          endDate: req.body['org-job-end'],
        },
      ],
      education: [
        {
          school: req.body['collage-name'],
          degree: req.body['degree-name'],
          startDate: req.body['degree-start'],
          endDate: req.body['degree-end'],
        },
      ],
    };

    const updateServiceProviders = await ServiceProviders.findOneAndUpdate(
      { user: updatedUser._id },
      payload,
      {
        new: true,
        upsert: true,
      },
    );

    if (!updatedUser.userDetails) {
      updatedUser.userDetails = updateServiceProviders._id;
      await updatedUser.save();
    }

    const trimmedRes = {
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        picture: updatedUser.picture,
        email: updatedUser.email,
        _id: updatedUser._id,
        is2FA: updatedUser.is2FA,
        role: updatedUser.role,
        ...updateServiceProviders.toObject(),
      },
    };
    actionLog(user._id, user.role, 'update_profile');
    console.log(trimmedRes);
    return successResponse(req, res, trimmedRes, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
}

exports.updateAvatar = async (req, res) => {
  try {
    let avatar;
    console.log(req.file);
    if (req.file) {
      avatar = req.file.filename;
    }

    const updatedUser = await Users.findByIdAndUpdate(
      req.user._id,
      {
        picture: avatar || req.user.picture,
      },
      { new: true },
    );

    const trimmedRes = {
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        picture: updatedUser.picture,
        email: updatedUser.email,
        is2FA: updatedUser.is2FA,
        role: updatedUser.role,
      },
    };

    return successResponse(req, res, trimmedRes, successMessages.DATA_UPDATED, 200)
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

exports.getProfile = async (req, res) => {
  try {
    let { user } = req;
    user = await Users.findById(user._id);

    let userObj = {
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      email: user.email,
      about: user.about,
      gender: user.gender,
      id: user._id,
      is2FA: user.is2FA,
      role: user.role
    };

    let trimmedRes;
    if (user.role === 'developer') {
      let userDetails = await ServiceProviders.findOne({ user: user._id });
      if (!userDetails) {
        userDetails = {}
      } else {
        userDetails = userDetails.toObject();
      }

      trimmedRes = {
        user: {
          ...userObj,
          ...userDetails,
        },
      };
    } else {
      trimmedRes = {
        user: userObj,
      };
    }
    actionLog(user._id, user.role, 'get_profile');
    console.log(trimmedRes);
    return successResponse(req, res, trimmedRes, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      const trimmedRes = {
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          picture: req.user.picture,
          email: req.user.email,
          _id: req.user._id,
          is2FA: req.user.is2FA,
          role: req.user.role,
          about: req.user.about,
          gender: req.user.gender,
        }
      }
      return successResponse(req, res, trimmedRes, successMessages.DATA_FETCHED, 200);
    }
    const fetchUser = await Users.findById(userId);

    if (!fetchUser) {
      return errorResponse(req, res, errorMessages.USER_NOT_EXIST, 400);
    }

    const trimmedRes = {
      user: {
        firstName: fetchUser.firstName,
        lastName: fetchUser.lastName,
        picture: fetchUser.picture,
        email: fetchUser.email,
        _id: fetchUser._id,
        role: fetchUser.role,
        about: fetchUser.about,
        gender: fetchUser.gender,
      },
    };
    actionLog(req.user._id, req.user.role, 'get_user');
    return successResponse(req, res, trimmedRes, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

exports.getAllUser = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1 },
    };

    const users = await Users.find().skip((options.page - 1) * options.limit).limit(options.limit).sort(options.sort).select({ password: 0, __v: 0 });
    actionLog(req.user._id, req.user.role, 'get_all_user');
    return successResponse(req, res, users, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

exports.getDetailedUsedrs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const searchQuery = search.trim();
    console.log(searchQuery);
    console.log(page, limit);
    const users = await Users.find({ role: { $ne: 'admin' }, $or: [{ firstName: { $regex: new RegExp(searchQuery, "i") } }, { lastName: { $regex: new RegExp(searchQuery, "i") } }] })
      .populate({
        path: "userDetails",
        match: {
          $or: [
            { technologies: { $regex: new RegExp(searchQuery, "i") } },
            { languages: { $regex: new RegExp(searchQuery, "i") } },
          ]
        },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select({ password: 0, __v: 0 });

    const trimmedUsers = users.map((user) => {
      const userObj = user.toObject();
      let userDetails = userObj.userDetails || {};
      return {
        user: {
          ...userObj,
          userDetails: {
            ...userDetails,
            projects: userDetails.projects || [],
            education: userDetails.education || [],
            experience: userDetails.experience || [],
          },
        },
      };
    });

    return successResponse(req, res, trimmedUsers, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

exports.getUserActivity = async (req, res) => {
  try {
    const { user } = req.query;
    const { page = 1, limit = 20 } = req.query;

    const query = user ? { $or: [{ _id: ObjectId(user) }] } : {};
    const userLogs = await UserLogs.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return successResponse(req, res, userLogs, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

exports.invite = async (req, res) => {
  try {
    const { email } = req.body;

    await sendEmail({
      email,
      subject: 'Invitation to join the Freelancer',
      message: 'You have been invited to join the Freelancer. Please click on the link to join the platform.',
      user: {
        name: `${req.user.firstName} ${req.user.lastName}`,
      }
    });
    return successResponse(req, res, {}, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}