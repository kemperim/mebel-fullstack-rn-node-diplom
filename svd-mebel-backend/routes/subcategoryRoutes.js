const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// Получение всех категорий
router.get('/', categoryController.getAllCategories);

// Получение подкатегорий по ID категории
router.get('/:categoryId/subcategories', categoryController.getSubcategoriesByCategory);

module.exports = router;

