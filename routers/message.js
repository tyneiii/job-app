const router = require('express').Router();
const {verifyToken, verifyAndAuth, verifyCompany} = require('../middleware/verifyToken');
const messageController = require('../controllers/messageController');

router.post('/', verifyAndAuth, messageController.sendMessage);

router.get('/:id', verifyAndAuth, messageController.getAllMessage);

module.exports = router;