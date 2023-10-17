module.exports = {
    /* the API access key when USE_API_AUTH is set to true */
    API_KEY: process.env.API_KEY || 'root',
    /* the password to access the admin page. The priority is given to the value in the .env */
    ADMIN_KEY: process.env.ADMIN_KEY || 'root',
    /* when set to true, the server will load the .env file keys. if false, the user should send the keys  */
    USE_DEFAULT_KEYS: true,
    /* make sure to create the .env file before setting this to true */
    USE_API_AUTH: true,
    /* show swagger docs */
    SHOW_SWAGGER: process.env.SHOW_SWAGGER !== 'false',

    /* AWS DEFAULT REGION */
    AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION,
    AWS_ACCESS_SECRET: process.env.AWS_ACCESS_SECRET,
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
};