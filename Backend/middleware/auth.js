const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in.' });

  let id;
  try {
    id = jwt.verify(token, process.env.JWT_SECRET).id;
  } catch {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }

  try {
    // A valid token is not enough if the account was deleted after the token was issued.
    if (!(await User.exists({ _id: id }))) {
      return res.status(401).json({ message: 'Account not found. Please sign up again.' });
    }
    req.userId = id;
    next();
  } catch (err) {
    next(err);
  }
};