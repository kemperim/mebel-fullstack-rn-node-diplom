const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController.js');

console.log(productController);
router.get('/', productController.getProducts);


module.exports = router; // <-- Должно быть!
