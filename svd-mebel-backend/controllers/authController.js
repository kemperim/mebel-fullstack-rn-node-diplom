const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("❌ Ошибка: JWT_SECRET не задан!");
    process.exit(1);
}

// 📌 Регистрация пользователя
const register = async (req, res) => {
    try {
        const { name, email, password, phone, address, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Заполните все обязательные поля" });
        }

        const trimmedEmail = email.trim();
        const existingUser = await User.findOne({ where: { email: trimmedEmail } });

        if (existingUser) {
            return res.status(400).json({ message: "Пользователь с таким email уже существует" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || "client";

        await User.create({
            name,
            email: trimmedEmail,
            password: hashedPassword,
            phone,
            address,
            role: userRole,
        });

        res.status(201).json({ message: "Регистрация успешна" });
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
};

// 📌 Авторизация
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Введите email и пароль" });
        }

        const trimmedEmail = email.trim();
        const user = await User.findOne({ where: { email: trimmedEmail } });

        if (!user) {
            return res.status(400).json({ message: "Пользователь не найден" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Неверный пароль" });
        }

        // Генерация токена
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ 
            message: "Авторизация успешна", 
            token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                is_verified: user.is_verified
            }
        });
    } catch (error) {
        console.error("Ошибка авторизации:", error);
        res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
};

// 📌 Получение данных пользователя
const getUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Получаем ID из middleware
        const user = await User.findByPk(userId, {
            attributes: ["id", "name", "email", "phone", "address", "role", "is_verified"]
        });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

module.exports = { register, login, getUser };
