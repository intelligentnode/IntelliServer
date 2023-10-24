// awsConfigMiddleware.js
const AWS = require('aws-sdk');
const config = require('../config');

const awsConfigProvider = (req, res, next) => {
    const accessKeyId = req.header('X-aws-access-Key');
    const secretAccessKey = req.header('X-aws-secret-Key');
    const region = req.header('X-aws-region');

    if (accessKeyId && secretAccessKey) {
        // Set up AWS SDK configuration with user-provided access key and secret
        AWS.config.update({
            accessKeyId,
            secretAccessKey,
            region: region ?? config.AWS_DEFAULT_REGION
        });
    }
    next(); // Continue with the next middleware or route handler
};

module.exports = awsConfigProvider;