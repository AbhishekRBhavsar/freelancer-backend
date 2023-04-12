const { ChatRoom } = require('../../../model/chatRoom');
const { ChatMessage } = require('../../../model/chatMessage');
const {
  successResponse,
  errorResponse,
  generateJWTtoken,
} = require('../../../helpers/helpers');
const { actionLog } = require('../../../helpers/dbOperation');
const { successMessages, errorMessages } = require('../../../helpers/messages');

const createMessage = async (req, res) => {
  try {
    const { chatRoomId, receiverId, message } = req.body;
    const senderId = req.user._id;
    console.log('senderId', senderId);
    console.log(req.body);
    const newMessage = new ChatMessage({
      chatRoomId,
      sender: senderId,
      message,
    });

    await newMessage.save();
    actionLog(req.user._id, req.user.role, 'createMessage');
    return successResponse(req, res, newMessage, successMessages.MESSAGE_CREATED, 201);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const getMessages = async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const messages = await ChatMessage.find({ chatRoomId });
    actionLog(req.user._id, req.user.role, 'getMessages');
    return successResponse(req, res, messages, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const createChatRoom = async (req, res) => {
  try {
    const { receiverId } = req.body;

    const senderId = req.body.senderId || req.user._id;
    const chatRoom = await ChatRoom.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (chatRoom) {
      return successResponse(req, res, chatRoom, successMessages.OPERATION_COMPLETED, 200);
    }
    const newChatRoom = new ChatRoom({
      members: [senderId, receiverId],
    });

    await newChatRoom.save();
    actionLog(req.user._id, req.user.role, 'createChatRoom');
    return successResponse(req, res, newChatRoom, successMessages.OPERATION_COMPLETED, 201);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const getChatRoomById = async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const chatRoom = await ChatRoom.findOne({ _id: chatRoomId });
    actionLog(req.user._id, req.user.role, 'getChatRoomById');

    return successResponse(req, res, chatRoom, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

const getChatRoomOfUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const chatRooms = await ChatRoom.find({ members: { $in: [userId] } });
    actionLog(req.user._id, req.user.role, 'getChatRoomOfUser');
    return successResponse(req, res, chatRooms, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const getChatRoomOfUsers = async (req, res) => {
  try {
    const { firstUserId, secondUserId } = req.params;
    const chatRooms = await ChatRoom.find({ members: { $all: [firstUserId, secondUserId] } });
    actionLog(req.user._id, req.user.role, 'getChatRoomOfUsers');
    return successResponse(req, res, chatRooms, successMessages.OPERATION_COMPLETED, 200);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.createMessage = createMessage;
exports.getMessages = getMessages;
exports.createChatRoom = createChatRoom;
exports.getChatRoomOfUser = getChatRoomOfUser;
exports.getChatRoomOfUsers = getChatRoomOfUsers;
exports.getChatRoomById = getChatRoomById;
