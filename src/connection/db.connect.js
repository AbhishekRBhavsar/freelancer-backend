const mongoose = require('mongoose');
const { envConstants } = require('../helpers/constants');
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectionObj = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

if (envConstants.AUTHENTICATION === 'false') delete connectionObj.auth;

exports.connect = async () => {
  mongoose.set('debug', true);
  try {
    if (process.env.NODE_ENV === 'test') {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      await mongoose.connect(mongoUri, connectionObj);
      console.log('Connected to test database');
    } else if (process.env.NODE_ENV === 'development') {
      await mongoose.connect(envConstants.DB_URI_TEST, connectionObj);
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
