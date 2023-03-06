const { OAuth2Client } = require('google-auth-library');
const { envConstants } = require('./constants');

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
