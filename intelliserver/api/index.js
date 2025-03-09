// Load the config
require('dotenv').config();

// Load the dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('../config');
const redoc = require('redoc-express');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger');

// Create the app
const app = express();

/* ### Initial config ### */
global.__basedir = path.join(__dirname, '..');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

// Set Handlebars as the view engine
app.set('view engine', 'hbs');
app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: null }));
app.set('views', path.join(__dirname, '../views'));

/* ### The API routes ### */

// # Middlewares
const authMiddleware = require('../middleware/auth');
const authAdminMiddleware = require('../middleware/authAdmin');

// # API
// Remote models
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const viewsRouter = require('./routes/views');
const openaiRouter = require('./models/remote/openai');
const cohereRouter = require('./models/remote/cohere');
const replicateRouter = require('./models/remote/replicate');
const stabilityRouter = require('./models/remote/stability');
const huggingRouter = require('./models/remote/hugging');
const vllmOfflineRouter = require('./models/offline/vllm');

// Functions
const chatRouter = require('./functions/chatbot');
const semanticRouter = require('./functions/semanticsearch');
const evaluateRouter = require('./functions/evaluate');
const chatContextRouter = require('./functions/chatcontext');
const parserRoute = require('./parser/index');
const ocrRoute = require('./ocr/index');
const embedRouter = require('./functions/embed');



// # api routers
app.use('/', indexRouter);
// Admin
app.use('/admin', authAdminMiddleware, adminRouter);

// Swagger json
app.get('/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// Swagger
if (config.SHOW_SWAGGER) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCssUrl: '/stylesheets/swagger.css',
  }));

  // redoc
  app.get('/redoc', redoc({
    title: 'IntelliServer ReDoc Docs',
    specUrl: '/swagger.json',
  }));
}

app.use('/views', viewsRouter);

// Secured APIs
app.use(authMiddleware);
// Models
app.use('/openai', openaiRouter);
app.use('/cohere', cohereRouter);
app.use('/replicate', replicateRouter);
app.use('/stability', stabilityRouter);
app.use('/hugging', huggingRouter);
app.use('/offline/vllm', vllmOfflineRouter);

// Functions
app.use('/chatbot', chatRouter);
app.use('/semanticsearch', semanticRouter);
app.use('/evaluate', evaluateRouter);
app.use('/chatcontext', chatContextRouter);
app.use('/embed', embedRouter);
app.use('/parser', parserRoute)
app.use('/ocr', ocrRoute)

/* ### Deploy the app ### */
const port = process.env.PORT || '80';
app.listen(port, () => {
  console.log(`Your intelliServer is running on PORT: ${port}`);
});

module.exports = app;
