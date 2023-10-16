const express = require('express');
const verifyToken = require('../funcs/verifyToken.js');
const Project = require('../models/project.js');
const File = require('../models/file.js');
const Submission = require('../models/submission.js');
const User = require('../models/user.js');
const upload = require('../funcs/upload.js');
const finalUpload = require('../funcs/finalUpload.js');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

// let oauth2Client;

// Middleware to authenticate the JWT token
const verifyManager = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'You are not authorised' });
        }
        next();
    })
};

// Manager Dashboard
router.get('/dashboard', verifyManager, (req, res) => {
    res.json({ message: 'You have access to the manager dashboard.' });
});

// Create Project
router.post('/createProject', verifyManager, upload.array('files', 15), async (req, res) => {
    try {
        const { name, editors, deadline } = req.body;
        const manager = req.user.id;

        const editorArray = Array.isArray(editors) ? editors : [editors];

        // Create a new project in MongoDB
        const project = new Project({
            name,
            manager,
            editors: editorArray,
            deadline,
        });

        await project.save();

        const fileDataArray = [];

        for (const file of req.files) {
            const newFile = new File({
                project: project._id,
                s3url: file.location,
                filename: file.originalname,
            });

            // Save file information to MongoDB
            await newFile.save();

            fileDataArray.push(newFile);
        }

        project.files = fileDataArray.map((fileData) => fileData._id);

        await project.save();

        res.status(201).json({ message: 'Project created successfully' });
    } catch (error) {
        //Rollback
        await Project.deleteOne({ name: req.body.name });
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Manager Projects
router.get('/projects', verifyManager, async (req, res) => {
    try {
        const userId = req.user.id;
        const userProjects = await Project.find({ manager: userId });
        res.status(200).json({ userProjects });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Project details
router.get('/projects/:id', verifyManager, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id });
        if (!project) {
            return res.status(403).json({ message: 'No such project found' });
        }

        // We need not to check the type of the ids. it will just check the ASCII value and go on.
        if (project.manager != req.user.id) {
            return res.status(403).json({ message: 'Your are not authorised to access this' });
        }

        res.status(200).json({ project });
    } catch (err) {
        console.error(err);
        res.status(500).json('Internal Server Error');
    }
});

// Approve submision to send it to YouTube
router.post('/approveSubmission/:id', verifyManager, async (req, res) => {
    try {

        const submission = await Submission.findOne({ _id: req.params.id });
        if (!submission) {
            return res.status(403).json({ message: 'Error! Wrong submission ID.' })
        }

        const project = await Project.findOne({ _id: submission.project });

        if (!project) {
            return res.status(403).json({ message: 'No such project found' });
        }

        if (project.manager != req.user.id) {
            return res.status(403).json({ message: 'You are not authorised for this action' });
        }

        const oauth2Client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_REDIRECT_URI,
        });

        try {
            oauth2Client.setCredentials(JSON.parse(manager.token));
            await finalUpload(submission, project, oauth2Client);
        } catch (err) {
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.force-ssl'],
                state: req.params.id
            });

            console.log(authUrl);

            res.redirect(authUrl);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/approveSubmission/callback', verifyManager, async (req, res) => {
    try {

        const authorizationCode = req.query.code;
        const state = req.query.state;

        const submission = await Submission.findOne({ _id: state });
        const project = await Project.findOne({ _id: submission.project });
        const manager = await User.findOne({ _id: req.user.id });

        const oauth2Client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_REDIRECT_URI,
        });


        const { tokens } = await oauth2Client.getToken(authorizationCode);

        oauth2Client.setCredentials(tokens);
        manager.token = JSON.stringify(tokens);
        manager.save();


        await finalUpload(submission, project, oauth2Client);
    } catch (error) {
        console.error('Authentication or upload error:', error);
        res.status(500).send('Authentication or upload error.');
    }
});



module.exports = router;
