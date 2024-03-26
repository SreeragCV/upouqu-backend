const Conversation = require("../model/conversation");
const Message = require("../model/message");
const pool = require("../config/dbconfig.js");

// send-message ############################################################
module.exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    console.log(message);
    const { userId: receiverId } = req.params;
    const senderId = req.user_id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    await Promise.all([conversation.save(), newMessage.save()]);
    return res.status(200).json(newMessage);
  } catch (e) {
    console.log("sendMessage controller error");
    return res.status(500).json({ error: "Server Error" });
  }
};

// get-message ##############################################################
module.exports.getMessage = async (req, res) => {
  try {
    const { userId: userToChatId } = req.params;
    const senderId = req.user_id;

    const conversation = await Conversation.findOne({
      participants: { $all: [userToChatId, senderId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    return res.status(200).json(conversation.messages);
  } catch (e) {
    console.log("getMessage controller error");
    return res.status(500).json({ error: "Server Error" });
  }
};

// get-conversations

module.exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user_id;
    const conversations = await Conversation.find({
      participants: { $in: currentUserId },
    });
    if (conversations.length < 1) {
      return res.status(200).json([]);
    }

    const requiredIds = conversations.map((elem) => elem.participants);
    const flatArray = requiredIds
      .flat(Infinity)
      .filter((elem) => elem !== currentUserId);
    const participantsIdsList = flatArray.map((id) => `'${id}'`).join(", ");

    const users = await pool.query(
      `SELECT user_id, full_name, username, dp_url, email FROM Users WHERE user_id IN (${participantsIdsList});`
    );

    return res.json({ allUsers: users.rows });
  } catch (e) {
    console.log("getConversation controller error");
    return res.status(500).json({ error: "Server Error" });
  }
};
