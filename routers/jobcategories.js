const router = require('express').Router();
const jobCategoryController = require('../controllers/jobCategoryController');
const {verifyToken, verifyAndAuth, verifyCompany} = require('../middleware/verifyToken');

router.post('/', verifyAndAuth, jobCategoryController.createCategory);

router.put('/:id', verifyAndAuth, jobCategoryController.updateCategory);

router.delete('/:id', verifyAndAuth, jobCategoryController.deleteCategory);

router.get('/:id', jobCategoryController.getCategory);

router.get('/', jobCategoryController.getAllCategories);

module.exports = router;