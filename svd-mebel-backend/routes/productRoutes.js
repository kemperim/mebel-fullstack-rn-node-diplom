// routes/products.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig'); // Используем импортированную конфигурацию multer
const productController = require('../controllers/productController');
const { Product, ProductImage, sequelize } = require('../models'); // Импортируем sequelize
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

// Определите путь к папке загрузок (убедитесь, что он совпадает с multerConfig)
const uploadDir = path.join(__dirname, '../uploads/images');

router.get('/products/:subcategoryId', productController.getProductsBySubcategory);
router.get('/product/:productId', productController.getProductById);
router.get('/products', productController.getAllProducts);

router.post(
    '/add',
    upload.array('images', 5),
    [
        body('category_id').isInt({ min: 1 }).withMessage('ID категории должен быть целым числом больше 0.'),
        body('subcategory_id').isInt({ min: 1 }).withMessage('ID подкатегории должен быть целым числом больше 0.'),
        body('name').trim().notEmpty().withMessage('Название товара обязательно.'),
        body('description').trim().notEmpty().withMessage('Описание товара обязательно.'),
        body('price').isFloat({ min: 0.01 }).withMessage('Цена должна быть числом больше 0.'),
        body('stock_quantity').isInt({ min: 0 }).withMessage('Количество на складе должно быть целым числом больше или равно 0.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, загрузите хотя бы одно изображение товара.'
            });
        }

        try {
            const { category_id, subcategory_id, name, description, price, stock_quantity, ar_model_path } = req.body;
            const firstImagePath = `/uploads/images/${req.files[0].filename}`; // Получаем путь к первому изображению

            const result = await sequelize.transaction(async (t) => {
                const newProduct = await Product.create({
                    category_id: parseInt(category_id),
                    subcategory_id: parseInt(subcategory_id),
                    name,
                    description,
                    price: parseFloat(price),
                    stock_quantity: parseInt(stock_quantity),
                    ar_model_path: ar_model_path || null,
                    image: firstImagePath, // Сохраняем путь к первому изображению
                }, { transaction: t });

                const imageRecords = await Promise.all(
                    req.files.map(file =>
                        ProductImage.create({
                            product_id: newProduct.id,
                            image_url: `/uploads/images/${file.filename}`,
                        }, { transaction: t })
                    )
                );

                return { product: newProduct, images: imageRecords };
            });

            const productWithImages = await Product.findByPk(result.product.id, {
                include: [{
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'image_url']
                }]
            });

            res.status(201).json({
                success: true,
                message: 'Товар успешно добавлен!',
                product: productWithImages
            });

        } catch (err) {
            console.error('Ошибка при добавлении товара:', err);
            if (req.files && req.files.length > 0) {
                await Promise.all(req.files.map(file => fs.unlink(path.join(uploadDir, file.filename)).catch(console.error)));
            }
            res.status(500).json({
                success: false,
                message: 'Не удалось добавить товар',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    }
);

module.exports = router;