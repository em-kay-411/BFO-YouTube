const express = require('express');
const verifyToken = require('../utils/verifyToken.js');
const Project = require('../models/project.js');
const File = require('../models/file.js');
const upload = require('../funcs/upload.js');
const router = express.Router();

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
            editors : editorArray,
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
        await Project.deleteOne({name: req.body.name});
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
router.get('/projects/:id', verifyManager, async(req, res) => {
    try{
        const project = await Project.findOne({ _id : req.params.id });
        if(!project){
            return res.status(403).json({message : 'No such project found'});
        }
        
        // We need not to check the type of the ids. it will just check the ASCII value and go on.
        if(project.manager != req.user.id){
            return res.status(403).json({ message : 'Your are not authorised to access this' });
        }

        res.status(200).json({ project });
    } catch(err){
        console.error(err);
        res.status(500).json('Internal Server Error');
    }
});

module.exports = router;
