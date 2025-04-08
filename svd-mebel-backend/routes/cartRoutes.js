const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Добавить товар в корзину
router.post('/add', cartController.addToCart);

// Получить содержимое корзины
router.get('/:userId', cartController.getCart);

// Удалить товар из корзины
router.delete('/remove/:itemId', cartController.removeItem);

// Очищение корзины
router.delete('/clear', cartController.clearCart);

// Обновить количество товара в корзине
router.put('/update/:itemId', cartController.updateQuantity);


module.exports = router;
