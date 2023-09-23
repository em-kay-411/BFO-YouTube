const s3 = require('./s3client.js');
const archiver = require('archiver');

async function downloadArchived(s3FileUrls) {
    try {
        const archive = archiver('zip'); // Create a ZIP archive

        // Set the response headers to trigger a file download dialog for the ZIP archive
        res.setHeader('Content-Disposition', 'attachment; filename=downloadedFiles.zip');
        res.setHeader('Content-Type', 'application/zip');

        // Pipe the ZIP archive to the response
        archive.pipe(res);

        // Download and add each file to the ZIP archive
        for (const s3FileUrl of s3FileUrls) {
            const urlParts = s3FileUrl.split('/');
            const bucketName = urlParts[2];
            const key = urlParts.slice(3).join('/');

            const s3Response = await s3.getObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise();
            const fileName = key.split('/').pop(); // Extract the filename from the S3 key

            archive.append(s3Response.Body, { name: fileName });
        }

        // Finalize the ZIP archive
        archive.finalize();
    } catch (error) {
        throw error;
    }
}
