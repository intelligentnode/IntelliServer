module.exports = {
    API_KEY: process.env.API_KEY || 'root',
    ADMIN_KEY: process.env.ADMIN_KEY || 'root',
    /* make sure to create .env file before making it true */
    USE_API_AUTH: (process.env.IS_API_AUTH === 'true') || false
};