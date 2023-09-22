const express = require('express');
const createError = require('../utils/error.js');
const verifyToken = require('../utils/verifyToken.js').default
const router = express.Router();

// Middleware to authenticate the JWT token
const verifyManager = (req, res, next) => {
    verifyToken(req, res, next, () => {
        if (req.user.role === 'manager') {
            next();
        } else {
            return next(createError(403, "You are not authorized!"));
        }
    });
};

router.get('/dashboard', verifyManager, (req, res) => {
    res.json({ message: 'You have access to the editor dashboard.' });
});

module.exports = router;
