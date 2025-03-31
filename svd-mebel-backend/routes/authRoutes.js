const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const db = require("../config/db"); // Подключение к базе MySQL
const User = require("../models/User");

router.post('/register', authController.register);
router.post('/login', authController.login);

// Маршрут для получения данных пользователя
router.get("/me", authMiddleware, async (req, res) => {
    console.log("📥 Запрос /me получен");

    if (!req.user || !req.user.userId) {
        console.log("❌ Ошибка: userId отсутствует");
        return res.status(400).json({ message: "Ошибка авторизации" });
    }

    const userId = req.user.userId;
    console.log("🆔 ID пользователя из токена:", userId);

    try {
        const user = await User.findByPk(userId, { attributes: { exclude: ["password"] } });

        if (!user) {
            console.log("❌ Пользователь не найден");
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user);
    } catch (error) {
        console.log("❌ Ошибка сервера при запросе /me:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


module.exports = router;
