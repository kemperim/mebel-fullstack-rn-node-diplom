const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// Получить все категории
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll();
    console.log("Категории на сервере:", categories); // Добавляем вывод данных
    res.json(categories);
  } catch (error) {
    console.error("Ошибка при получении категорий:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


module.exports = router;
