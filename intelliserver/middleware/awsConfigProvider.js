// awsConfigMiddleware.js
const AWS = require('aws-sdk');
const path = require('path');

const config = require(path.join(global.__basedir, 'config'));

const awsConfigProvider = (req, res, next) => {
    const accessKeyId = req.header('X-aws-access-Key');
    const secretAccessKey = req.header('X-aws-secret-Key');
    const region = req.header('X-aws-region');

    req.awsConfig = {};
    if (config.USE_DEFAULT_KEYS && accessKeyId && secretAccessKey) {
        req.awsConfig = {
            accessKeyId,
            secretAccessKey,
            region: region ?? config.AWS_DEFAULT_REGION
        };
    } else {
        req.awsConfig = {
            accessKeyId: config.AWS_ACCESS_KEY,
            secretAccessKey: config.AWS_ACCESS_SECRET,
            region: config.AWS_DEFAULT_REGION
        };
    }

    // Continue with the next middleware or route handler
    next();
};

module.exports = awsConfigProvider;