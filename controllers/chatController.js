const Chat = require('../models/Chat');
const User = require('../models/User');

module.exports = {
    accessChat: async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        try {
            let chat = await Chat.find({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: req.user.id } } },
                    { users: { $elemMatch: { $eq: userId } } }
                ]
            })
                .populate("users", "-password")
                .populate("latestMessage");

            chat = await User.populate(chat, {
                path: "latestMessage.sender",
                select: "username profile email"
            });

            if (chat.length > 0) {
                let fullChat = chat[0].toObject();
                if (!fullChat.hasOwnProperty('latestMessage')) {
                    fullChat.latestMessage = null;
                }
                return res.status(200).json(fullChat);
            } else {
                const ChatData = {
                    chatName: req.user.id,
                    isGroupChat: false,
                    users: [req.user.id, userId]
                };

                const createdChat = await Chat.create(ChatData);
                let fullChat = await Chat.findOne({ _id: createdChat._id })
                    .populate("users", "-password")
                    .populate("latestMessage");

                fullChat = fullChat.toObject();
                if (!fullChat.latestMessage) {
                    fullChat.latestMessage = null;
                }

                return res.status(200).json(fullChat);
            }
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },


    getChat: async (req, res) => {
        try {
            Chat.find({ users: { $elemMatch: { $eq: id } } })
                .populate("users", "-password")
                .populate("groupAdmin", "-password")
                .populate("latestMessage")
                .sort({ updatedAt: -1 })
                .then(async (results) => {
                    results = await User.populate(results, {
                        path: "lastMessage.sender",
                        select: "username profile email"
                    });
                    res.status(200).json(results);
                })
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}