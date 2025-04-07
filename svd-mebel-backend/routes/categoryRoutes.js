const express = require('express');
const { Category } = require('../models');
const router = express.Router();

// Получение всех категорий
router.get('/', async (req, res) => {
  try {
    // Запрос всех категорий
    const categories = await Category.findAll();

    // Если категории не найдены
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Категории не найдены' });
    }

    // Возвращаем все категории
    res.json(categories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

module.exports = router;
