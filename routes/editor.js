const express = require('express');
const verifyToken = require('../utils/verifyToken.js');
const router = express.Router();

// Middleware to authenticate the JWT token
const verifyEditor = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'editor') {
            return res.status(403).json({message : 'You are not authorised'});
        }
        next();
    })
};

router.get('/dashboard', verifyEditor, (req, res) => {
    res.json({ message: 'You have access to the editor dashboard.' });
});

module.exports = router;
