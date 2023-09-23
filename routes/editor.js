const express = require('express');
const verifyToken = require('../utils/verifyToken.js');
const Project = require('../models/project.js');
const Submission = require('../models/submission.js');
const User = require('../models/user.js');
const router = express.Router();
const upload = require('../funcs/uploadSubmission.js');

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

// Editor's Projects
router.get('/projects', verifyEditor, async (req, res) => {
    try{
        const editor = req.user.id;

        const projects = await Project.find({editors : editor});

        res.status(200).json({ projects });
    } catch(err){
        res.status(500).json(err);
    }
});

// Project details
router.get('/projects/:id', verifyEditor, async(req, res) => {
    try{
        const project = await Project.findOne({ _id : req.params.id });
        if(!project.editors.includes(req.params.id)){
            return res.status(403).json({message : 'You are not authorised to access this project'});
        }
        if(!project){
            return res.status(403).json({message : 'No such project found'});
        }
        
        // We need not to check the type of the ids. it will just check the ASCII value and go on.
        if(!project.editors.includes(req.user.id)){
            return res.status(403).json({ message : 'Your are not authorised to access this' });
        }

        res.status(200).json({ project });
    } catch(err){
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/submit/:id', verifyEditor, upload.array('files', 5), async (req, res) => {
    try {
        const project = await Project.findOne({_id : req.params.id});
        if(!project.editors.includes(req.params.id)){
            return res.status(403).json({message : 'You are not allowed to submit to this project'});
        }
        const submissionsArray = [];

        for (const file of req.files) {
            const newSubmssion = new Submission({
                project: req.params.id,
                s3url: file.location,
                filename: file.originalname,
            });
            
            // Save file information to MongoDB
            await newSubmssion.save();

            submissionsArray.push(newSubmssion);
        }

        project.submissions = submissionsArray.map((fileData) => fileData._id);

        await project.save();

        res.status(201).json({ message: 'Submitted Successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
