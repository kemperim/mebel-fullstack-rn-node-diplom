const express = require('express');
const { Subcategory } = require('../models');
const router = express.Router();

// Получение всех подкатегорий
router.get('/', async (req, res) => {
  try {
    // Запрос всех подкатегорий
    const subcategories = await Subcategory.findAll();

    // Если подкатегории не найдены
    if (subcategories.length === 0) {
      return res.status(404).json({ message: 'Подкатегории не найдены' });
    }

    // Возвращаем все подкатегории
    res.json(subcategories);
  } catch (error) {
    console.error('Ошибка получения подкатегорий:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});



module.exports = router;

