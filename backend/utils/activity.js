const Activity = require('../models/Activity');

const logActivity = async (req, entry) => {
  try {
    await Activity.create({
      userId: req.user?.sub,
      email: req.user?.email,
      ...entry
    });
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
};

module.exports = { logActivity };
