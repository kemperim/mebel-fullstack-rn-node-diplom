// routes/products.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = require('../config/multerConfig'); 
const productController = require('../controllers/productController');
const { Product } = require('../models');  // Импорт через index.js


router.get('/products/:subcategoryId', productController.getProductsBySubcategory);

router.get('/product/:productId', productController.getProductById);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images'); // Папка для хранения изображений
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Добавление времени к имени файла
    }
  });
  

  
  // Маршрут для добавления товара
  router.post('/add', upload.single('image'), async (req, res) => {
    try {
      const { category_id, subcategory_id, name, description, price, stock_quantity } = req.body;
      const image = req.file ? req.file.filename : null; // Если файл загружен, используем его имя
  
      const newProduct = await Product.create({
        category_id,
        subcategory_id,
        name,
        description,
        price,
        stock_quantity,
        image, // Передаем имя изображения
        createdAt: new Date(),
        updatedAt: new Date()
      });
  
      res.status(201).json(newProduct);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
module.exports = router;
