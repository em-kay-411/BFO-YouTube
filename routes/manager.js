const express = require('express');
const verifyToken = require('../utils/verifyToken.js');
const router = express.Router();

// Middleware to authenticate the JWT token
const verifyManager = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'manager') {
            return res.status(403).json({message : 'You are not authorised'});
        }
        next();
    })
};

router.get('/dashboard', verifyManager, (req, res) => {
    res.json({ message: 'You have access to the manager dashboard.' });
});

module.exports = router;
