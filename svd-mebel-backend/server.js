require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET не найден в переменных окружения (.env)! Используется небезопассное значение по умолчанию.");
    process.env.JWT_SECRET = 'your_secret_key_unsafe_for_production';
}

const models = require('./models');
const sequelize = require("./config/db");
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const authenticateUser = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const uploadRouter = require('./routes/uploadsRoutes');

// Синхронизация с базой данных
sequelize.sync().then(() => console.log("✅ Таблица пользователей обновлена"));

const app = express();

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(cors());
app.use('/web', express.static(path.join(__dirname, 'web')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/admin", adminRoutes);
app.use('/auth', authRoutes);
app.use('/category', categoryRoutes);
app.use('/subcategory', subcategoryRoutes);
app.use('/products', productRoutes);
app.use('/user', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRouter);
app.use('/upload', uploadRouter);

const PORT = 5000;

// Создаем HTTP сервер
const server = http.createServer(app);

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`✅ HTTP сервер запущен на порту ${PORT}`);
});

// Обработка ошибок сервера
server.on('error', (error) => {
    console.error('❌ Ошибка сервера:', error);
});

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
    console.error('❌ Необработанное исключение:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Необработанное отклонение промиса:', error);
});