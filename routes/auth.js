const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const createError = require('../utils/error.js');

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, role });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res, next) => {
    const user = await User.findOne({username : req.body.username});
    if(!user){
        return res.status(400).json({ message: 'User does not exist' });
    }

    const isPassword = await bcrypt.compare(req.body.password, user.password);

    if(!isPassword){
        return res.status(400).json({ message: 'Wrong Password' });
    }

    const token = jwt.sign({
        id: user.id,
        username: user.username,
        role : user.role
    }, process.env.JWT_SECRET);

    res.cookie('access_token', token, { httpOnly: true, noTimeStamp: true}).status(200).json({ message : 'Login successful' , token});
});

module.exports = router;
