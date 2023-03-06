/* eslint-disable no-console */
const chalk = require('chalk');
const fs = require('fs');
const http = require('http');
const https = require('https');
const app = require('./app');
const { envConstants } = require('./src/helpers/constants');

const cert = fs.existsSync(envConstants.SSL_CERT_PATH)
              && fs.readFileSync(envConstants.SSL_CERT_PATH);
const key = fs.existsSync(envConstants.SSL_KEY_PATH) && fs.readFileSync(envConstants.SSL_KEY_PATH);

let server;

if (key && cert) {
  server = https.createServer({ key, cert }, app);
} else {
  server = http.createServer(app);
}

// process.on('message', (message, connection) => {
//   if (message !== 'sticky-session:connection') return;
//   server.emit('connection', connection);
//   connection.resume();
// });

process.on('uncaughtException', (uncaughtExc) => {
  console.log('uncaughtException::', uncaughtExc);
  console.error(chalk.bgRed('UNCAUGHT EXCEPTION! 💥 Shutting down...'));
  console.error('uncaughtException Err::', uncaughtExc);
  console.error('uncaughtException Stack::', JSON.stringify(uncaughtExc.stack));
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error(chalk.bgRed('UNHANDLED PROMISE REJECTION! 💥 Shutting down...'));
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.info('💥 Process terminated!');
  });
});

server.listen(envConstants.APP_PORT || 5152, () => {
  console.info(`Server & Socket listening on port ${chalk.blue(`${envConstants.APP_HOST}:${envConstants.APP_PORT}`)}`);
});
console.log('hello');
