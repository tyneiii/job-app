const router = require('express').Router();
const {verifyToken, verifyAndAuth, verifyCompany} = require('../middleware/verifyToken');
const userController = require('../controllers/userController');

router.put('/', verifyAndAuth,  userController.updateUser);

router.put('/changepassword', verifyAndAuth,  userController.changePassword);

router.put('/updateprofile', verifyAndAuth,  userController.updateProfileUser);

router.delete('/:id', verifyAndAuth, userController.deleteUser);

router.get('/', verifyAndAuth, userController.getUser);

// router.get('/', userController.getAllUser);

// add skill
router.post('/skills', verifyAndAuth,  userController.addSkills);

// get skill
router.get('/skills', verifyAndAuth,  userController.getSkills);

// delete skill
router.delete('/skills/:id', verifyAndAuth,  userController.deleteSkills);

// add company
router.post('/companys', verifyAndAuth,  userController.addCompany);

//update company
router.put('/companys/:id', verifyAndAuth,  userController.updateCompany);

// get single company
router.get('/companys/:uid', verifyAndAuth,  userController.getCompany);

// get multiple companys
router.get('/companys', verifyAndAuth,  userController.getCompanys);

module.exports = router;