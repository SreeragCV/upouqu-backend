const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationModel = new Schema(
  {
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Message',
        default: [],
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationModel);

module.exports = Conversation;
