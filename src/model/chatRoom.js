const mongoose = require('mongoose');

const ChatRoomSchema = mongoose.Schema(
  {
    members: Array,
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

exports.ChatRoom = ChatRoom;
