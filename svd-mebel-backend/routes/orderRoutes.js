// routes/orderRouter.js

const express = require('express');
const orderController = require('../controllers/orderController');
const getUserOrders = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware'); 
const getOrderDetails = require('../controllers/orderController');



const router = express.Router();

// Применяем authMiddleware к маршруту создания заказа
router.post('/create', authMiddleware, orderController.createOrder);
router.get('/my',authMiddleware,orderController.getUserOrders);
router.get('/order/:id', authMiddleware, orderController.getOrderDetails);

module.exports = router;
