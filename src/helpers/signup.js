let { OAuth2Client } = require('google-auth-library');
const { envConstants } = require('./constants');
// const mock = require('../../tests/users.test');

// if (process.env.NODE_ENV === 'test') {
//   OAuth2Client = mock.OAuth2Client;
// }
const client = new OAuth2Client(envConstants.GOOGLE_CLIENT_ID);

exports.verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: envConstants.GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: error.message };
  }
};
