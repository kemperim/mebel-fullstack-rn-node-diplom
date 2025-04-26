const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const productController = require('../controllers/productController');
const { Product, ProductImage, sequelize, ProductAttribute, ProductAttributeValue } = require('../models');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads/images');

router.get('/products/:subcategoryId', productController.getProductsBySubcategory);
router.get('/product/:productId', productController.getProductById);
router.get('/products', productController.getAllProducts);

router.get('/attributes/subcategory/:subcategoryId', async (req, res) => {
    const { subcategoryId } = req.params;
    try {
        const attributes = await ProductAttribute.findAll({
            where: { subcategory_id: subcategoryId }
        });
        res.json(attributes);
    } catch (error) {
        console.error('Ошибка при получении атрибутов по подкатегории:', error);
        res.status(500).json({ message: 'Не удалось получить атрибуты' });
    }
});

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
        console.log('Получен POST-запрос на /products/add');
        console.log('Тело запроса (req.body):', req.body);
        console.log('Загруженные файлы (req.files):', req.files);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Ошибка валидации:', errors.array());
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        if (!req.files || req.files.length === 0) {
            console.log('Нет загруженных изображений.');
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, загрузите хотя бы одно изображение товара.'
            });
        }

        try {
            const { category_id, subcategory_id, name, description, price, stock_quantity, ar_model_path, attributes } = req.body;
            const firstImagePath = `/uploads/images/${req.files[0].filename}`;

            // Парсим атрибуты из JSON-строки
            let parsedAttributes = [];
            try {
                parsedAttributes = attributes ? JSON.parse(attributes) : {};
                // Преобразуем объект в массив {attribute_id, value}
                parsedAttributes = Object.entries(parsedAttributes).map(([attribute_id, value]) => ({
                    attribute_id: parseInt(attribute_id),
                    value: String(value)
                }));
            } catch (e) {
                console.error('Ошибка парсинга атрибутов:', e);
                parsedAttributes = [];
            }

            console.log('Обработанные атрибуты на сервере:', parsedAttributes);

            const result = await sequelize.transaction(async (t) => {
                const newProduct = await Product.create({
                    category_id: parseInt(category_id),
                    subcategory_id: parseInt(subcategory_id),
                    name,
                    description,
                    price: parseFloat(price),
                    stock_quantity: parseInt(stock_quantity),
                    ar_model_path: ar_model_path || null,
                    image: firstImagePath,
                }, { transaction: t });

                // Сохраняем изображения
                await Promise.all(
                    req.files.map(file => 
                        ProductImage.create({
                            product_id: newProduct.id,
                            image_url: `/uploads/images/${file.filename}`,
                        }, { transaction: t })
                    )
                );

                // Сохраняем атрибуты
                if (parsedAttributes.length > 0) {
                    await Promise.all(
                        parsedAttributes.map(attr => 
                            ProductAttributeValue.create({
                                product_id: newProduct.id,
                                attribute_id: attr.attribute_id,
                                value: attr.value,
                            }, { transaction: t })
                        )
                    );
                }

                return newProduct;
            });

            // Получаем товар со всеми связанными данными
            const productWithDetails = await Product.findByPk(result.id, {
                include: [
                    { model: ProductImage, as: 'images' },
                    { 
                        model: ProductAttributeValue, 
                        as: 'ProductAttributeValues',
                        include: [{ model: ProductAttribute, as: 'attribute' }]
                    }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Товар успешно добавлен!',
                product: productWithDetails
            });

        } catch (err) {
            console.error('Ошибка при добавлении товара:', err);
            // Удаляем загруженные файлы в случае ошибки
            if (req.files?.length > 0) {
                await Promise.all(
                    req.files.map(file => 
                        fs.unlink(path.join(uploadDir, file.filename)).catch(console.error)
                    )
                );
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