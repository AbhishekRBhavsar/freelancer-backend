/* eslint-disable no-console */
const chalk = require('chalk');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
const sioRedis = require('socket.io-redis');
const https = require('https');
const app = require('./app');
const { envConstants } = require('./src/helpers/constants');
const { Users } = require('./src/model/users');

const cert = fs.existsSync(envConstants.SSL_CERT_PATH)
              && fs.readFileSync(envConstants.SSL_CERT_PATH);
const key = fs.existsSync(envConstants.SSL_KEY_PATH) && fs.readFileSync(envConstants.SSL_KEY_PATH);

let server;

if (key && cert) {
  server = https.createServer({ key, cert }, app);
} else {
  server = http.createServer(app);
}

const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:3000', envConstants.FRONT_END_URL],
    methods: ['GET', 'POST'],
    allowedHeaders: '*',
  },
});

global.onlineUsers = new Map();

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

if (envConstants.REDIS_SERVER === 'true') {
  io.adapter(sioRedis({ host: 'localhost', port: 6379, requestsTimeout: 5000 }));
}

io.on('connection', (socket) => {
  console.log("HELLO< I'M CONNECTED< FROM OTHER SIDE");

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.emit("getUsers", Array.from(onlineUsers));
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const sendUserSocket = onlineUsers.get(receiverId);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("getMessage", {
        senderId,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(getKey(onlineUsers, socket.id));
    socket.emit("getUsers", Array.from(onlineUsers));
  });

  // socket.on('CLIENT_JOINED', async (data) => {
  //   console.info('TCL: data ->  ', data);
  //   const userData = await Users.findOne({ where: { id: data.id } });
  //   if (userData) {
  //     socket.join(data.id);
  //   }
  // });

  // socket.on('disconnect', async () => {
  //   console.warn(socket.id, 'Got disconnect');
  // });
});

process.on('message', (message, connection) => {
  if (message !== 'sticky-session:connection') return;
  server.emit('connection', connection);
  connection.resume();
});

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

module.exports = io;