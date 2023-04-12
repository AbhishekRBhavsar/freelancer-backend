const cors = require('cors');
const rateLimit = require('express-rate-limit');
const userRoutes = require('../controllers/v1/user/routes');
const jobRoutes = require('../controllers/v1/job/routes');
const clientRoutes = require('../controllers/v1/client/routes');
const chatRoutes = require('../controllers/v1/chat/routes');
const { envConstants } = require('../helpers/constants');
const { errorMessages } = require('../helpers/messages');
const { authentication } = require('../middleware/auth');

const whitelist = [`${envConstants.FRONT_END_URL}`, `${envConstants.APP_HOST}:${envConstants.APP_PORT}`, 'http://localhost:3000', '*'];

const perIpTimeLimit = 15 * 60 * 1000; // 15 minutes

const corsOptions = {
  origin(origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error(errorMessages.CORS_BLOCK));
    }
  },
};

const { errorHandler } = require('../middleware/errorHandler');

const apiLimiter = rateLimit({
  windowMs: perIpTimeLimit,
  max: 1000,
  message: {
    error: errorMessages.TOO_MANY_REQUESTS,
  },
});

const routes = (app) => {
  app.use('/api/v1', cors(corsOptions), apiLimiter, userRoutes);
  app.use('/api/v1', cors(corsOptions), apiLimiter, jobRoutes);
  app.use('/api/v1', cors(corsOptions), apiLimiter, clientRoutes);
  app.use('/api/v1/chat', cors(corsOptions), apiLimiter, authentication, chatRoutes);
  app.use(errorHandler);
};

module.exports = { routes };
