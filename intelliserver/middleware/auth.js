const config = require('../config');

module.exports = function(req, res, next) {
    const apiKey = req.header('X-API-KEY');

    if (config.USE_API_AUTH && (!apiKey || apiKey !== config.API_KEY)) {
        return res.status(401).json({ message: 'Unauthorized. Invalid or missing API key.' });
    }
    next();
};