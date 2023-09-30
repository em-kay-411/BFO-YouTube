const s3 = require('./s3client.js');
const { google } = require('googleapis');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
});

async function getKey(url) {
    const urlParts = url.split('/');
    const key = urlParts.slice(3).join('/');

    // To convert %20 to spaces
    const decodedKey = decodeURIComponent(key);

    return decodedKey;
}

async function finalUpload(submission, project) {
    const s3Bucket = process.env.RENDERED_BUCKET;

    const videoKey = getKey(submission.s3url);
    const thumbnailKey = getKey(submission.thumbnail_url);
    const subtitlesKey = getKey(submission.subtitles_url);

    const videoObject = s3.getObject({ Bucket: s3Bucket, Key: videoKey }).promise();
    const thumbnailObject = s3.getObject({ Bucket: s3Bucket, Key: thumbnailKey }).promise();
    const subtitlesObject = s3.getObject({ Bucket: s3Bucket, Key: subtitlesKey }).promise();

    const videoSnippet = {
        title: submission.video_title,
        description: submission.video_description,
        categoryId: '22', // Entertainment category, change as needed
        defaultLanguage: submission.defaultLanguage, // Set the default language for subtitles
    };

    const videoStatus = { privacyStatus: submission.privacy };

    const videoMetadata = {
        snippet: videoSnippet,
        status: videoStatus,
    };

    const youtubeResponse = youtube.videos.insert({
        resource: videoMetadata,
        part: 'snippet,status,contentDetails',
        media: {
            mimeType: 'video/*',
            body: videoObject.Body,
        },
    });

    if (thumbnailObject) {
        youtube.thumbnails.set({
            videoId: youtubeResponse.data.id,
            media: {
                mimeType: 'image/jpeg',
                body: thumbnailObject.Body,
            },
        });
    }

    if (subtitlesObject) {
        youtube.captions.insert({
            part: 'snippet',
            resource: {
                snippet: {
                    videoId: youtubeResponse.data.id,
                    language: 'en', // Set the language code for the subtitles
                    name: 'English',
                    isDraft: false,
                    isAutoSynced: true,
                    status: 'serving',
                },
            },
            media: {
                mimeType: 'application/x-subrip',
                body: subtitlesObject.Body,
            },
        });
    }


    project.status = 'done';
}

module.exports = finalUpload;