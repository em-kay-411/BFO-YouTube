const express = require('express');
const verifyToken = require('../utils/verifyToken.js');
const createError = require('../utils/error.js');
const router = express.Router();

// Middleware to authenticate the JWT token
const verifyEditor = (req, res, next) => {
    verifyToken(req, res, next, () => {
        console.log(req.user.role);
        if (req.user.role === 'editor') {
            next();
        } else {
            return next(createError(403, "You are not authorized!"));
        }
    });
};

router.get('/dashboard', verifyEditor, (req, res) => {
    res.json({ message: 'You have access to the editor dashboard.' });
});

module.exports = router;
