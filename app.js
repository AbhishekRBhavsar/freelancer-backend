const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dbConn = require('./src/connection/db.connect');
const { envConstants } = require('./src/helpers/constants');

const app = express();
// const { getROLES } = require('./src/middleware/middleware');

app.options('*', cors());
app.use(cors());

dbConn.connect();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  console.log(req.path);
  next();
})
app.use(logger('dev', { skip: () => process.env.NODE_ENV === 'test' }));
// app.use('/', express.static('./public'));
app.use('/', express.static('./storage'));
// app.get('/', (req, res) => {
//   res.statusCode = 302;
//   res.setHeader('Location', `${envConstants.APP_HOST}:${envConstants.APP_PORT}/api-docs`);
//   res.end();
// });
// getROLES(); // to generate the ROLE object for role based authentication/authorization

require('./src/routes/routing').routes(app);

module.exports = app;
