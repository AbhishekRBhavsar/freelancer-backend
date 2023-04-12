const {
  successResponse,
  errorResponse,
  generateJWTtoken,
} = require('../../../helpers/helpers');
const { actionLog } = require('../../../helpers/dbOperation');

const { successMessages, errorMessages } = require('../../../helpers/messages');
const { Users } = require('../../../model/users');
const { ServiceProviders } = require('../../../model/serviceProviders');
const { Clients } = require('../../../model/clients');
const { Organization } = require('../../../model/jobs');
const { updateAvatar } = require('../user/controller');


const getClientProfile = async (req, res) => {
  try {
    const clientId = req.user._id;

    let clientFetch = await Clients.findOne({ user: clientId }).populate('organization');

    console.log('CLIENT ID', clientFetch);
    if (!clientFetch) return errorResponse(req, res, errorMessages.DATA_NOT_FOUND, 400);

    if (!clientFetch) {
      clientFetch = {
        organization: null,
      }
    } else {
      clientFetch = clientFetch.toObject();
    }
    const resData = {
      user: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        picture: req.user.picture,
        email: req.user.email,
        id: req.user._id,
        is2FA: req.user.is2FA,
        role: req.user.role,
        about: req.user.about,
        ...clientFetch,
      },
    }

    console.log(resData);

    return successResponse(req, res, resData, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
}

const updateProfile = async (req, res) => {
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

    console.log("UPDATE PROFILE CLIENT", req.body);

    const payload = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      about: about || user.about,
      gender: gender || user.gender,
      experiance: experiance || user.experiance,
    };

    if (email && email !== req.user.email) {
      let isEmailExist;
      try {
        isEmailExist = await Users.findOne(
          { email: email.toLowerCase(), _id: { $ne: user._id } },
        );
        if (isEmailExist) {
          return errorResponse(req, res, errorMessages.EMAIL_ALREADY_EXIST, 400);
        }
        payload.email = email;
      } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
      }
    }

    const updatedUser = await Users.findByIdAndUpdate(
      user._id,
      payload,
      { new: true },
    );

    const trimmedRes = {
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        picture: updatedUser.picture,
        email: updatedUser.email,
        _id: updatedUser._id,
        is2FA: updatedUser.is2FA,
        role: updatedUser.role,
      },
    };
    actionLog(user._id, user.role, 'update_profile');
    console.log(trimmedRes);
    return successResponse(req, res, trimmedRes, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
}

const updateClientOrganization = async (req, res) => {
  try {
    const {
      id,
    } = req.body;

    let org;
    if (id) {
      org = await Organization.findOne({ _id: id });
    }

    console.log("ORG", org);
    if (!org) {
      return errorResponse(req, res, errorMessages.DATA_NOT_FOUND, 400);
    }

    const client = await Clients.findOneAndUpdate(
      { user: req.user._id },
      { $set: { organization: org._id } },
      {
        new: true,
        upsert: true,
      },
    );

    actionLog(req.user._id, req.user.role, 'update_client_organization');
    return successResponse(req, res, client, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
}

const updateClientProject = async (req, res) => {
  try {
    const {
      projects
    } = req.body;

    const client = await Clients.findOneAndUpdate(
      { user: req.user._id },
      { $set: { projects } },
      {
        new: true,
        upsert: true,
      },
    );

    actionLog(req.user._id, req.user.role, 'update_profile');
    return successResponse(req, res, client, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
}

exports.getClientProfile = getClientProfile;
exports.updateProfile = updateProfile;
exports.updateClientProject = updateClientProject;
exports.updateClientOrganization = updateClientOrganization;
// exports.updateAvatar = updateAvatar;
