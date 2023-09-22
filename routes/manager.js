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

router.get('/dashboard', verifyManager, (req, res) => {
    res.json({ message: 'You have access to the manager dashboard.' });
});

router.post('/createProject', verifyManager, upload.array('files', 15), async (req, res) => {
    try {
        const { name, editors, deadline } = req.body;
        const manager = req.user.id;

        // Create a new project in MongoDB
        const project = new Project({
            name,
            manager,
            editors,
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
        await Project.delete({name: req.body.name});
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/projects', verifyManager, async (req, res) => {
    try {
        const userId = req.user.id;
        const userProjects = await Project.find({ manager: userId });
        res.status(200).json({ userProjects });
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router;
