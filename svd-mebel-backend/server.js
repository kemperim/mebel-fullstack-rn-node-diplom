require('dotenv').config();
process.env.JWT_SECRET = 'your_secret_key'; // Принудительное указание ключа

console.log("🔑 Загруженный JWT_SECRET:", process.env.JWT_SECRET);
const models = require('./models'); // Импорт всех моделей + ассоциаций
const sequelize = require("./config/db"); // Добавь этот импорт
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); 
const authRoutes = require('./routes/authRoutes'); 
const productRoutes = require('./routes/productRoutes');
const authenticateUser = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const Subcategory = require('./models/Subcategory');
const cartRoutes = require('./routes/cartRoutes');
sequelize.sync().then(() => console.log("✅ Таблица пользователей обновлена"));




const app = express();
app.use(express.json());
app.use(cors());
app.use("/admin", adminRoutes);
app.use('/auth', authRoutes); 
app.use('/category', categoryRoutes);
app.use('/subcategory', subcategoryRoutes);
app.use('/products', productRoutes); 
app.use('/user', userRoutes);
app.use('/cart', cartRoutes);





const PORT = 5000;
app.listen(PORT, () => {
    console.log(` Сервер запущен ${PORT}`);
});
