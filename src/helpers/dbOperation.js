
const { UserLogs } = require('../model/userLogs');

exports.actionLog = async (userId, role, action) => {
  try {
    console.log(`${userId} (${role}) is doing ${action}`);
    await UserLogs.create({ user: userId, action, role });
  } catch (error) {
    if (process.env.DEBUG) {
      console.log(error);
    }
  }
}