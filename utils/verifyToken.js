const jwt = require('jsonwebtoken');
const createError = require('../utils/error.js');

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ message: 'You are not authenticated' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err){
        return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = verifyToken;