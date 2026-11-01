const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Sign in required.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Your session has expired. Sign in again.' });
  }

  try {
    const user = await User.findById(payload.sub).select('disabled role').lean();
    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists. Sign in again.' });
    }
    if (user.disabled) {
      return res.status(403).json({ error: 'This account has been disabled.' });
    }
    req.user = { ...payload, role: user.role };
    next();
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Could not verify your session.' });
  }
};
