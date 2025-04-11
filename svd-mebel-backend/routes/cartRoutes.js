const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const verifyToken = require('../middleware/authMiddleware');  // Подключаем middleware для проверки токена

// Добавить товар в корзину (перед этим проверяем авторизацию)
router.post('/add', verifyToken, cartController.addToCart);

// Получить содержимое корзины (перед этим проверяем авторизацию)
router.get('/:userId', verifyToken, cartController.getCart);  // userId берем из токена

// Удалить товар из корзины
router.delete('/remove/:itemId', verifyToken, cartController.removeItem);

// Очистить корзину
router.delete('/clear', verifyToken, cartController.clearCart);

// Обновить количество товара в корзине
router.put('/update/:itemId', verifyToken, cartController.updateQuantity);

module.exports = router;
