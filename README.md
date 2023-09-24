Authentication works on JWT tokens 

Signup requires the username, email, password and role to be entered.
During login a JWT cookie is sent to the client which is further used everywhere. This cookie is not visible to the client as it is httpOnly

Database Schemas
File ---> All project files
    Contains 3 fields - 
    1. Project ID - The project to which it is associated to
    2. s3URL - URL from S3 Bucket
    3. filename - Name of the file

Project ---> Projects
    Contains 5 fields
    1. Name - Name of the project
    2. Manager - ID of the manager of the project
    3. Files - Array of ids of files associated with the project
    4. Editors - Array of editor ids assigned to the project
    5. Deadline - Project Deadline

User ---> All users 
    Contains 4 fields
    1. Username : Unique username
    2. Email : Email ID of the user
    3. Role : Role of the user. Either a manager or an editor
    4. Password : Password of the user account

Submission ---> Used for only the submitted project files by editors
    Contains 3 fields - 
    1. Project ID - The project to which it is associated to
    2. s3URL - URL from S3 Bucket
    3. filename - Name of the file

Storages 
S3_BUCKET = filebuck --> To store all the files of the project
VIDEO_BUCKET = vidbuck --> To store all the rendered projects submitted by the editors

upload.js --> Upload middleware of multer is configured to upload to files s3
uploadSubmission.js --> Upload middleware of multer is configured to upload to video s3
Multer is a library used to take the input multiprat/form-data of files and upload it on to the server
or AWS S3 in this case.

`/createProject` route uses the multer-s3 library to upload files to S3. 
Algorithm -->
    1.  The client will submit a form that will consist of project name, deadline, files and editors
    2.  A new project model entry will be instantiated and project name, deadline, editors and 
        managerid will be assigned
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