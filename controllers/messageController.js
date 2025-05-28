const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');
const moment = require('moment-timezone');

const convertDateFields = (doc) => {
    const obj = doc.toObject();
    obj.createdAt = moment(obj.createdAt).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
    obj.updatedAt = moment(obj.updatedAt).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
    return obj;
};

const convertArrayDates = (docs) => docs.map(convertDateFields);

module.exports = {
    getAllMessage: async (req, res) => {
        const pageSize = 12;
        const page = parseInt(req.query.page) || 1;
        const chatId = req.params.id;

        // Validate chatId
        if (!chatId || !chatId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid or missing chatId" });
        }

        try {
            const skipMessages = (page - 1) * pageSize;

            let messages = await Message.find({ chat: chatId })
                .populate('sender', 'username profile')
                .populate({
                    path: 'chat',
                    populate: {
                        path: 'users',
                        select: 'username profile email'
                    }
                })
                .sort({ createdAt: -1 })
                .limit(pageSize)
                .skip(skipMessages);

            res.status(200).json(convertArrayDates(messages));
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: "Could not fetch messages" });
        }
    },


    sendMessage: async (req, res) => {
        const { content, chatId, receiver } = req.body;

        if (!content || !chatId) {
            return res.status(400).json({ error: "Invalid data" });
        }

        try {
            let message = await Message.create({
                sender: req.user.id,
                content,
                chat: chatId,
                receiver
            });

            message = await message.populate('sender', 'username profile');
            message = await message.populate('chat');
            message = await User.populate(message, {
                path: 'chat.users',
                select: 'username profile email'
            });

            await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

            res.status(200).json(convertDateFields(message));
        } catch (error) {
            console.error("SendMessage Error:", error);
            res.status(400).json({ error: error.message || "Unknown error" });
        }
    }

}