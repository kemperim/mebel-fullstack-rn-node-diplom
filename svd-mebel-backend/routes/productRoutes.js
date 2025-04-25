const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig'); // Используем импортированную конфигурацию multer
const productController = require('../controllers/productController');
const { Product, ProductImage, sequelize, ProductAttribute, ProductAttributeValue } = require('../models'); // Импортируем ProductAttributeValue
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

// Определите путь к папке загрузок (убедитесь, что он совпадает с multerConfig)
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
        // *** УДАЛЯЕМ СТАРЫЕ ПРАВИЛА ВАЛИДАЦИИ ДЛЯ АТРИБУТОВ КАК JSON ***
        // body('attributes').isArray().optional(),
        // body('attributes.*.attribute_id').isInt({ min: 1 }).optional(),
        // body('attributes.*.value').notEmpty().optional(),
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
            const { category_id, subcategory_id, name, description, price, stock_quantity, ar_model_path } = req.body;
            const firstImagePath = `/uploads/images/${req.files[0].filename}`; // Получаем путь к первому изображению
            const attributes = [];

            // Обрабатываем атрибуты, отправленные как отдельные поля формы
            for (const key in req.body) {
                if (key.startsWith('attributes[')) {
                    const attributeId = parseInt(key.split('[')[1].split(']')[0]);
                    const value = req.body[key];
                    if (!isNaN(attributeId)) {
                        attributes.push({ attribute_id: attributeId, value });
                    }
                }
            }

            console.log('Обработанные атрибуты на сервере:', attributes); // <---- ДОБАВЛЕНО ЛОГИРОВАНИЕ

            console.log('Данные для создания товара:', { category_id, subcategory_id, name, description, price, stock_quantity, ar_model_path, attributes, firstImagePath });

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
                console.log('Товар создан:', newProduct.toJSON());

                const imageRecords = await Promise.all(
                    req.files.map(file => {
                        const imageRecord = ProductImage.create({
                            product_id: newProduct.id,
                            image_url: `/uploads/images/${file.filename}`,
                        }, { transaction: t });
                        console.log('Запись об изображении создана:', imageRecord);
                        return imageRecord;
                    })
                );

                // Сохраняем атрибуты товара
                if (attributes && Array.isArray(attributes) && attributes.length > 0) {
                    console.log('Массив атрибутов перед сохранением:', attributes); // <---- ДОБАВЛЕНО ЛОГИРОВАНИЕ
                    const attributeValuePromises = attributes.map(attr => {
                        const attributeValue = ProductAttributeValue.create({
                            product_id: newProduct.id,
                            attribute_id: parseInt(attr.attribute_id),
                            value: attr.value,
                        }, { transaction: t });
                        console.log('Значение атрибута создано:', attributeValue);
                        return attributeValue;
                    });
                    await Promise.all(attributeValuePromises);
                    console.log('Значения атрибутов сохранены.');
                }

                return { product: newProduct, images: imageRecords };
            }, { logging: console.log }); // <---- ВКЛЮЧЕНО ЛОГИРОВАНИЕ SQL

            const productWithDetails = await Product.findByPk(result.product.id, {
                include: [
                    {
                        model: ProductImage,
                        as: 'images',
                        attributes: ['id', 'image_url']
                    },
                    {
                        model: ProductAttributeValue,
                        as: 'ProductAttributeValues',
                        include: [{
                            model: ProductAttribute,
                            as: 'attribute',
                            attributes: ['id', 'name', 'type']
                        }]
                    }
                ]
            });
            console.log('Товар с деталями:', productWithDetails ? productWithDetails.toJSON() : null);

            res.status(201).json({
                success: true,
                message: 'Товар успешно добавлен!',
                product: productWithDetails
            });
            console.log('Ответ сервера (успех):', { success: true, message: 'Товар успешно добавлен!', product: productWithDetails ? productWithDetails.toJSON() : null });

        } catch (err) {
            console.error('Ошибка при добавлении товара:', err);
            if (req.files && req.files.length > 0) {
                await Promise.all(req.files.map(file => fs.unlink(path.join(uploadDir, file.filename)).catch(console.error)));
                console.log('Удалены загруженные файлы из-за ошибки.');
            }
            res.status(500).json({
                success: false,
                message: 'Не удалось добавить товар',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
            console.log('Ответ сервера (ошибка):', { success: false, message: 'Не удалось добавить товар', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
        }
    }
);

module.exports = router;