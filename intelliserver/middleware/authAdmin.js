const config = require('../config');

module.exports = function(req, res, next) {
    const adminKey = req.header('X-API-KEY');

    if (!adminKey || adminKey !== config.ADMIN_KEY) {
        return res.status(401).json({ message: 'Unauthorized. Invalid or missing Admin key.' });
    }

    next();
};