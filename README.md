# Authentication
Authentication works on JWT tokens 
Signup requires the username, email, password and role to be entered.
During login a JWT cookie is sent to the client which is further used everywhere. This cookie is not visible to the client as it is httpOnly

# Database Schemas
### File ---> All project files
Contains 3 fields  
- Project ID - The project to which it is associated to
- s3URL - URL from S3 Bucket
- filename - Name of the file

### Project ---> Projects
Contains 5 fields  
- Name - Name of the project
- Manager - ID of the manager of the project
- Files - Array of ids of files associated with the project
- Editors - Array of editor ids assigned to the project
- Deadline - Project Deadline

### User ---> All users 
Contains 4 fields  
- Username : Unique username
- Email : Email ID of the user
- Role : Role of the user. Either a manager or an editor
- Password : Password of the user account

### Submission ---> Used for only the submitted project files by editors
Contains 3 fields  
- Project ID - The project to which it is associated to
- s3URL - URL from S3 Bucket
- filename - Name of the file

# Storages 
`S3_BUCKET = filebuck` --> To store all the files of the project  
`VIDEO_BUCKET = vidbuck` --> To store all the rendered projects submitted by the editors  

# Special Middlewares
`upload.js` --> Upload middleware of multer is configured to upload to files s3  
`uploadSubmission.js` --> Upload middleware of multer is configured to upload to video s3  
Multer is a library used to take the input multiprat/form-data of files and upload it on to the server
or AWS S3 in this case.

# Route Handlers
`/createProject` route uses the multer-s3 library to upload files to S3. 
##### Algorithm 
1.  The client will submit a form that will consist of project name, deadline, files and editors  
2.  A new project model entry will be instantiated and project name, deadline, editors and managerid will be assigned  
3.  This entry is saved into the MongoDB database  
4.  Using the multer-s3 middleware we have already uploaded the files to S3 when the route was called  
5.  req.files will contain all the files data after uploading.  
6.  req.files is enhanced by the upload middleware of multer-s3  
7.  For every file, create a new file instance, set values and upload it to the MongoDB database  
8.  Simultaneously store these file data objects in an array  
9.  Now assign the project.files to be file IDs of all the files associated with the project  
10. Save the project.  

The same above Algorithm is used for submitting rendered projects for editors. The files have to be passed 
as form-data

# Google API Info
Authentication for YouTube (Google) is done using OAuth2.0 authentication. The app being in testing phase is accessible only to permitted users. 

# Video Uploading
#### Algorithm
1. `POST` request is hit on `approveSubmission/:id` route handler.
2. OAuth2.0 authentication will be verified. 
3. If the token available in the database for the manager is valid, it will authenticate and call the `finalUpload` function.
4. If the token is not valid, a new token will be generated and the user will be redirected to the authentication URL.
5. During authentication, the authoraization code is obtained and sent to a callback URL defined in the GOOGLE API configurations for redirect URIs.
6. The code is sent as query parameter. This code is extracted, and a new token is generated for the manager.
7. The token is saved to the database for the manager to reuse.
8. `finalUpload()` function is called.