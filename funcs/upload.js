const s3 = require('./s3client.js');
const multer = require('multer');
const multerS3 = require('multer-s3');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'filebuck',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

// // Define a function to upload files to S3
// function uploadFiles(req, res, next) {
//     // Use the 'upload' Multer middleware to handle the file uploads
//     upload.array('files', 5)(req, res, function (err) {
//         if (err) {
//             return next(err);
//         }

//         const files = req.files;

//         // Handle form data and files as needed
//         // For example, you can log the S3 URLs of the uploaded files
//         files.forEach((file) => {
//             console.log('File uploaded to S3:', file.location);
//         });

//         // Call the next middleware or send a response to the client
//         res.send('Form data received, and files uploaded to S3 successfully.');
//     });
// }

module.exports = upload;