const s3 = require('./s3client.js');
const { google } = require('googleapis');

async function getKey(url) {
    const urlParts = url.split('/');
    const key = urlParts.slice(3).join('/');

    // To convert %20 to spaces
    const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));

    return decodedKey;
}

async function finalUpload(submission, project, oauth2Client) {
    const s3Bucket = process.env.RENDERED_BUCKET;

    const videoKey = await getKey(submission.s3url);
    let thumbnailKey;
    if(submission.thumbnail_url){
        thumbnailKey = await getKey(submission.thumbnail_url);
    }

    let subtitlesKey;
    if(submission.subtitles_url){
        subtitlesKey = await getKey(submission.subtitles_url);
    }

    const videoObject = await s3.getObject({ Bucket: s3Bucket, Key: videoKey })
    let thumbnailObject;
    if(thumbnailKey){
        thumbnailObject = await s3.getObject({ Bucket: s3Bucket, Key: thumbnailKey })
    }

    let subtitlesObject;
    if(subtitlesKey){
        subtitlesObject = await s3.getObject({ Bucket: s3Bucket, Key: subtitlesKey })
    }
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

    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
    });

    console.log(videoObject);

    // const youtubeResponse = await youtube.videos.insert({
    //     auth: oauth2Client,
    //     resource: videoMetadata,
    //     part: 'snippet,status,contentDetails',
    //     media: {
    //         mimeType: 'video/*',
    //         body: videoObject.Body,
    //     },
    // });

    // if (thumbnailObject) {
    //     youtube.thumbnails.set({
    //         videoId: youtubeResponse.data.id,
    //         media: {
    //             mimeType: 'image/jpeg',
    //             body: thumbnailObject.Body,
    //         },
    //     });
    // }

    // if (subtitlesObject) {
    //     youtube.captions.insert({
    //         auth: oauth2Client,
    //         part: 'snippet',
    //         resource: {
    //             snippet: {
    //                 videoId: youtubeResponse.data.id,
    //                 language: 'en', // Set the language code for the subtitles
    //                 name: 'English',
    //                 isDraft: false,
    //                 isAutoSynced: true,
    //                 status: 'serving',
    //             },
    //         },
    //         media: {
    //             mimeType: 'application/x-subrip',
    //             body: subtitlesObject.Body,
    //         },
    //     });
    // }

    // project.status = 'done';
}

module.exports = finalUpload;
