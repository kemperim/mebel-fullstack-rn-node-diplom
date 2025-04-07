// routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products/:subcategoryId', productController.getProductsBySubcategory);

router.get('/product/:productId', productController.getProductById);
module.exports = router;
