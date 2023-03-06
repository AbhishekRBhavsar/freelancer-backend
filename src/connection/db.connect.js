const mongoose = require('mongoose');
const { envConstants } = require('../helpers/constants');

const connectionObj = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

if (envConstants.AUTHENTICATION === 'false') delete connectionObj.auth;

exports.connect = async () => {
  mongoose.set('debug', envConstants.DB_DEBUG_MODE === 'true');
  try {
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connect(envConstants.DB_URI_TEST, connectionObj);
      console.log('Connected to test database');
    } else {
      await mongoose.connect(envConstants.DB_URI, connectionObj);
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

exports.removeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

/* exports.disconnect = async () => {
  mongoose.Promise = global.Promise;
  await mongoose.disconnect();
}; */
