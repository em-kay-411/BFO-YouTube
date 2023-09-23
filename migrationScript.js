const Project = require('./models/project.js');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/youtuber', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function updateDocs() {
    try {
        const documentsToUpdate = await Project.find({}); // Find all documents

        for (const doc of documentsToUpdate) {
            // Update the document according to your new schema
            doc.status = 'ongoing'; // You can set a default value or compute it as needed
            await doc.save();
            console.log(`Updated ${doc._id}`);
        }

        console.log('Documents updated successfully.');
        return;
    }
    catch (error) {
        console.error('Error updating documents:', error);

    }
}

updateDocs();