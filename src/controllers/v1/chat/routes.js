const express = require("express");

const {
  createChatRoom,
  getChatRoomOfUser,
  getChatRoomOfUsers,
  getMessages,
  createMessage,
} = require("./controller");

const router = express.Router();
const { authentication } = require("../../../middleware/auth");

router.post("/message", authentication,createMessage);
router.post("/room", authentication, createChatRoom);
router.get("/message/:chatRoomId", authentication, getMessages);
router.get("/room/:userId", authentication, getChatRoomOfUser);
router.get("/room/job/:chatRoomId", authentication, getChatRoomOfUsers);
router.get("/room/:firstUserId/:secondUserId", authentication, getChatRoomOfUsers);
module.exports = router;