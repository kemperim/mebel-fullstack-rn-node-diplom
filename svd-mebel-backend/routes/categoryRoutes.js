// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const Category = require('../models');  // Правильный путь к модели

// Получение всех категорий
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();  // Здесь должно работать
    res.json(categories);
  } catch (err) {
    console.error('Ошибка при получении категорий:', err);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router;
