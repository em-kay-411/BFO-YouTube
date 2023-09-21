const createError = (status, message) => {
    const err = new Error(message); // Pass the message to the Error constructor
    err.status = status;
    return err;
};

module.exports = createError;