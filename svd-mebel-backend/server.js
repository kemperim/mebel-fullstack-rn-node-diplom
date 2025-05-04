require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET не найден в переменных окружения (.env)! Используется небезопасное значение по умолчанию.");
    process.env.JWT_SECRET = 'your_secret_key_unsafe_for_production';
}

const models = require('./models');
const sequelize = require("./config/db");
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

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
sequelize.sync().then(() => console.log("✅ Таблицы синхронизированы с базой данных"));

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

// HTTP server (порт 5000)
const HTTP_PORT = 5000;
http.createServer(app).listen(HTTP_PORT, () => {
    console.log(`🌐 HTTP сервер запущен на порту ${HTTP_PORT}`);
});

// HTTPS server (порт 443 или из .env)
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
let httpsOptions;

try {
    httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, 'server.crt')),
    };

    https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
        console.log(`🔐 HTTPS сервер запущен на порту ${HTTPS_PORT}`);
    });
} catch (err) {
    console.error("❌ Ошибка загрузки SSL-сертификатов:", err.message);
}

// Глобальная обработка ошибок
process.on('uncaughtException', (error) => console.error('❌ Необработанное исключение:', error));
process.on('unhandledRejection', (error) => console.error('❌ Необработанное отклонение промиса:', error));
