const express = require('express');
const createError = require('../utils/error.js');
const verifyToken = require('../utils/verifyToken.js')
const router = express.Router();

// Middleware to authenticate the JWT token
const verifyManager = (req, res, next) => {
    verifyToken(req, res, next, () => {
        console.log(req.user.role);
        if (req.user.role === 'manager') {
            next();
        } else {
            return next(createError(403, "You are not authorized!"));
        }
    });
};

router.get('/dashboard', verifyManager, (req, res) => {
    res.json({ message: 'You have access to the manager dashboard.' });
});

module.exports = router;
