const router = require('express').Router();
const {verifyToken, verifyAndAuth, verifyCompany} = require('../middleware/verifyToken');
const chatController = require('../controllers/chatController');

router.post('/', verifyAndAuth, chatController.accessChat);

router.get('/', verifyAndAuth, chatController.getChat);

module.exports = router;