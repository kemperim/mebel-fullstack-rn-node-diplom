const pool = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = {getProducts};