const {
  successResponse,
  errorResponse,
  generateJWTtoken,
} = require('../../../helpers/helpers');
const { actionLog } = require('../../../helpers/dbOperation');

const { successMessages, errorMessages } = require('../../../helpers/messages');
const { Users } = require('../../../model/users');
const { Jobs, Organization } = require('../../../model/jobs');
const { ServiceProviders } = require('../../../model/serviceProviders');
const { Clients } = require('../../../model/clients');


const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      location,
      budget,
      hourlyRate,
      jobType,
      position,
      duration,
    } = req.body;

    if (!title || !description || !skills || !location || !budget || !jobType || !position || !duration) {
      return errorResponse(req, res, errorMessages.INVALID_PARAMS, 400);
    }
    const client = await Clients.findOne({ user: req.user._id });

    console.log(client);
    if (!client) return errorResponse(req, res, errorMessages.COMLETE_CLIENT_PROFILE, 404);

    const payload = {
      title,
      description,
      skills,
      location,
      budget,
      hourlyRate,
      status: 'open',
      jobType,
      position,
      duration,
      postedBy: req.user._id,
      organization: client.organization || null,
    };
    const job = await Jobs.create(payload);

    console.log("CREATE JOB", job);
    actionLog(req.user._id, req.user.role, 'created_job');
    return successResponse(req, res, job, successMessages.JOB_CREATED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
}

const getJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Jobs.findOne({ _id: jobId }).populate('postedBy').populate('organization');

    if (!job) return errorResponse(req, res, errorMessages.DATA_NOT_FOUND, 404);

    actionLog(req.user._id, req.user.role, 'view_job');
    return successResponse(req, res, job, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};

const getJobs = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1 },
    };

    console.log(req.query);
    const query = {};
    if (search && search !== 'undefined') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skills: { $in: [search] } },
        { location: { $regex: search, $options: 'i' } },
        { jobType: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    } else {
      const userDetail = await ServiceProviders.findOne({ user: req.user._id });
      if (userDetail) {
        let userSkills = [];
        userDetail.technologies.length > 0 ? userSkills = [...userSkills, ...userDetail.technologies] : null;
        userDetail.languages.length > 0 ? userSkills = [...userSkills, ...userDetail.languages] : null;
        userDetail.libsAndPackages.length > 0 ? userSkills = [...userSkills, ...userDetail.libsAndPackages] : null;
        userDetail.frameworks.length > 0 ? userSkills = [...userSkills, ...userDetail.frameworks] : null;
        userDetail.databases.length > 0 ? userSkills = [...userSkills, ...userDetail.databases] : null;

        userSkills.length > 0 ? query.skills = { $in: userSkills } : null;
      }
    }
    console.log(query);

    const jobs = await Jobs.find(query)
      .populate({ path: 'postedBy', select: { _id: 1, firstName: 1, lastName: 1, email: 1, picture: 1 } })
      .populate({ path: 'organization' })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .select({ _id: 1, title: 1, description: 1, skills: 1, location: 1, budget: 1, hourlyRate: 1, jobType: 1, position: 1, duration: 1, status: 1, createdAt: 1 });

    actionLog(req.user._id, req.user.role, 'view_jobs');
    return successResponse(req, res, jobs, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};

const getClientJobs = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort: { createdAt: -1 },
    }

    const jobs = await Jobs.find({ postedBy: req.user._id })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .populate('organization')
      .select({ _id: 1, title: 1, description: 1, skills: 1, location: 1, budget: 1, hourlyRate: 1, jobType: 1, position: 1, duration: 1, status: 1, createdAt: 1 });

    console.log("JOB FETCHED.", jobs);
    actionLog(req.user._id, req.user.role, 'view_listed_jobs');
    return successResponse(req, res, jobs, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      title,
      description,
      skills,
      location,
      budget,
      hourlyRate,
      jobType,
      position,
      duration,
      organizationId,
      status,
    } = req.body;

    const jobObj = await Jobs.findOne({ _id: jobId });

    if (!jobObj) return errorResponse(req, res, errorMessages.BAD_REQUEST, 400);

    if (jobObj.postedBy.toString() !== req.user._id.toString()) {
      return errorResponse(req, res, errorMessages.UNAUTHORIZED, 401);
    }

    if (jobObj.status === 'closed') {
      return errorResponse(req, res, errorMessages.JOB_CLOSED, 400);
    }

    // if ()

    if (title) jobObj.title = title;
    if (description) jobObj.description = description;
    if (location) jobObj.location = location;
    if (budget) jobObj.budget = budget;
    if (hourlyRate) jobObj.hourlyRate = hourlyRate;
    if (jobType) jobObj.jobType = jobType;
    if (position) jobObj.position = position;
    if (duration) jobObj.duration = duration;
    if (organizationId) jobObj.organization = organizationId;

    if (status && status === 'closed') jobObj.status = 'closed';

    if (skills.length > 0) {
      jobObj.skills = skills;
    }

    await jobObj.save();

    actionLog(req.user._id, req.user.role, 'updated_job');
    return successResponse(req, res, successMessages.DATA_UPDATED, 200, jobObj);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};

const createOrganization = async (req, res) => {
  try {
    const { name, about, location, website } = req.body;

    console.log(req.body);
    if (!name || !about || !location || !website) {
      return errorResponse(req, res, errorMessages.INVALID_PARAMS, 400);
    }

    const payload = {
      name,
      about,
      location,
      website,
    };

    if (req.file) {
      payload.image = req.file.filename;
      payload._id = req.uuid;
    }
    const organization = await Organization.create(payload);

    const updateClient = await Clients.findOneAndUpdate(
      { user: req.user._id },
      {
        $set:
        {
          organization: organization._id,
        }
      },
      {
        new: true,
        upsert: true,
      },
    )

    actionLog(req.user._id, req.user.role, 'created_organization');
    return successResponse(req, res, organization, successMessages.ORGANIZATION_CREATED, 201);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
}

const getOrganizations = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    console.log(req.query);
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    };

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const organizations = await Organization.find(query, options).select({ _id: 1, name: 1 });
    console.log("ORGANIZATION FETCH SEARCH", organizations);

    // actionLog(req.user._id, req.user.role, 'view_organizations');
    return successResponse(req, res, organizations, successMessages.DATA_FETCHED, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};

exports.createJob = createJob;
exports.getJob = getJob;
exports.getJobs = getJobs;
exports.updateJob = updateJob;
exports.createOrganization = createOrganization;
exports.getOrganizations = getOrganizations;
exports.getClientJobs = getClientJobs;
