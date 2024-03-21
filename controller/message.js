const Conversation = require("../model/conversation");
const Message = require("../model/message");

// send-message ############################################################
module.exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
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

    if(!conversation) return res.status(200).json([]);

    const messages = conversation.messages;
    
    return res.status(200).json(messages);
  } catch (e) {
    console.log("getMessage controller error");
    return res.status(500).json({ error: "Server Error" });
  }
};
