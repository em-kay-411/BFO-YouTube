const s3 = require('./s3client.js');
const path = require('path');
const stream = require('stream');

async function downloadFile(s3FileUrl, res) {
    try {
        const urlParts = s3FileUrl.split('/');
        const bucketName = urlParts[2];
        const key = urlParts.slice(3).join('/');

        const decodedKey = decodeURIComponent(key);

        const s3Response = await s3.getObject({ Bucket: process.env.S3_BUCKET, Key: decodedKey }).promise();

        // Extract the file extension from the decoded key
        const fileExtension = path.extname(decodedKey).slice(1);

        // Set the response headers to trigger a file download dialog with the appropriate content type
        res.setHeader('Content-Disposition', `attachment; filename=downloadedFile.${fileExtension}`);
        res.setHeader('Content-Type', `application/${fileExtension}`);

        // Pipe the file stream to the response
        const readableStream = stream.Readable.from(s3Response.Body);

        // Pipe the readable stream to the response
        readableStream.pipe(res);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}

module.exports = downloadFile;