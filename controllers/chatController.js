const Chat = require('../models/Chat');
const User = require('../models/User');

module.exports = {
    accessChat: async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        try {
            // Tìm chat riêng (1-1 chat) giữa 2 user
            let chat = await Chat.find({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: req.user.id } } },
                    { users: { $elemMatch: { $eq: userId } } }
                ]
            })
                .populate("users", "-password")
                .populate("latestMessage");

            // Populate cho sender trong latestMessage
            chat = await User.populate(chat, {
                path: "latestMessage.sender",
                select: "username profile email"
            });

            // Hàm chuyển Document thành Object và đảm bảo latestMessage luôn có giá trị
            const defaultLatestMessage = {
                _id: "",
                sender: { _id: "", username: "", email: "", profile: "" },
                content: "",
                receiver: "",
                chat: ""
            };

            if (chat.length > 0) {
                let fullChat = chat[0].toObject();
                // Nếu latestMessage không tồn tại hoặc là object rỗng, gán default object
                if (!fullChat.latestMessage || Object.keys(fullChat.latestMessage).length === 0) {
                    fullChat.latestMessage = defaultLatestMessage;
                }
                return res.status(200).json(fullChat);
            } else {
                // Nếu chưa tồn tại chat, tạo mới
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
                if (!fullChat.latestMessage || Object.keys(fullChat.latestMessage).length === 0) {
                    fullChat.latestMessage = defaultLatestMessage;
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