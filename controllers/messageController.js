const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

module.exports = {
    getAllMessage: async (req, res) => {
        try {
            const pageSize = 12;
            const page = req.query.page || 1;
            const skipMessages = (page - 1) * pageSize;
            const messages = await Message.find({chat: req.params.id})
                .populate('sender', 'username profile')
                .populate('chat')
                .sort({createdAt: -1}).limit(pageSize).skip(skipMessages);

            messages = await User.populate(messages, {
                path: 'chat.users',
                select: 'username profile email'
            });

            res.status(200).json(messages);
            
        } catch (error) {
            res.status(500).json({ error: "Could not fetch messages" });
        }
    },
    
    sendMessage: async (req, res) => {
        const {content, chatId, receiver} = req.body;
        
        if(!content || !chatId){
            console.log("Invalid data")
            return res.status(400).json("Invalid data");
        }

        var newMessage = new Message({
            sender: req.user.id,
            content: content,
            chat: chatId,
            receiver: receiver
        });

        try {
            var message = await newMessage.create(newMessage);
            message = await message.populate('sender', 'username profile');
            message = await message.populate('chat');
            message = await User.populate(message, {
                path: 'chat.users',
                select: 'username profile email'
            });
            await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage: message});
            
            res.status(200).json(message);
        } catch (error) {
            res.status(400).json({ error: error });
        }
    }
}