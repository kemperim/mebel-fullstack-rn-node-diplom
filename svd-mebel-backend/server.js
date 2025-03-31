require('dotenv').config();
process.env.JWT_SECRET = 'your_secret_key'; // Принудительное указание ключа

console.log("🔑 Загруженный JWT_SECRET:", process.env.JWT_SECRET);
const sequelize = require("./config/db"); // Добавь этот импорт
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); 
const authRoutes = require('./routes/authRoutes'); 
const productRoutes = require('./routes/productRoutes');
const authenticateUser = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');
sequelize.sync().then(() => console.log("✅ Таблица пользователей обновлена"));

const adminRoutes = require("./routes/adminRoutes");


const app = express();
app.use(express.json());
app.use(cors());
app.use("/admin", adminRoutes);
app.use('/auth', authRoutes); 

app.use('/products', productRoutes); 
app.use('/user', userRoutes);



const PORT = 5000;
app.listen(PORT, () => {
    console.log(` Сервер запущен ${PORT}`);
});
