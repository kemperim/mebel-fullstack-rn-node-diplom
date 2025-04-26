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

router.get('/attributes', async (req, res) => {
    try {
        const attributes = await ProductAttribute.findAll();
        res.json(attributes);
    } catch (error) {
        console.error('Ошибка при получении всех атрибутов:', error);
        res.status(500).json({ message: 'Не удалось получить атрибуты' });
    }
});

router.put(
    '/edit/:productId',
    upload.array('newImages', 5), // Используем другое название поля для новых изображений
    [
        body('category_id').optional().isInt({ min: 1 }).withMessage('ID категории должен быть целым числом больше 0.'),
        body('subcategory_id').optional().isInt({ min: 1 }).withMessage('ID подкатегории должен быть целым числом больше 0.'),
        body('name').optional().trim().notEmpty().withMessage('Название товара обязательно.'),
        body('description').optional().trim().notEmpty().withMessage('Описание товара обязательно.'),
        body('price').optional().isFloat({ min: 0.01 }).withMessage('Цена должна быть числом больше 0.'),
        body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Количество на складе должно быть целым числом больше или равно 0.'),
        body('ar_model_path').optional().trim(),
        body('attributes').optional().isString().withMessage('Атрибуты должны быть строкой в формате JSON.'),
        body('deletedImages').optional().isString().withMessage('Удаленные изображения должны быть строкой в формате JSON.')
    ],
    async (req, res) => {
        const { productId } = req.params;
        console.log(`Получен PUT-запрос на /products/edit/${productId}`);
        console.log('Тело запроса (req.body):', req.body);
        console.log('Загруженные новые файлы (req.files):', req.files);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Ошибка валидации при редактировании:', errors.array());
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const product = await Product.findByPk(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Товар не найден.' });
            }

            const { category_id, subcategory_id, name, description, price, stock_quantity, ar_model_path, attributes, deletedImages } = req.body;

            await sequelize.transaction(async (t) => {
                // Обновляем основные поля товара
                await product.update({
                    category_id: category_id !== undefined ? parseInt(category_id) : product.category_id,
                    subcategory_id: subcategory_id !== undefined ? parseInt(subcategory_id) : product.subcategory_id,
                    name: name !== undefined ? name : product.name,
                    description: description !== undefined ? description : product.description,
                    price: price !== undefined ? parseFloat(price) : product.price,
                    stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : product.stock_quantity,
                    ar_model_path: ar_model_path !== undefined ? ar_model_path : product.ar_model_path,
                    // Не обновляем главное изображение здесь, обрабатываем ниже с новыми загрузками
                }, { transaction: t });

                let deletedImageUrls = [];
                if (deletedImages) {
                    try {
                        deletedImageUrls = JSON.parse(deletedImages);
                    } catch (error) {
                        console.error('Ошибка парсинга deletedImages:', error);
                        res.status(400).json({ success: false, message: 'Неверный формат deletedImages JSON.' });
                        return;
                    }
                }
    
                // Получаем текущие изображения товара из таблицы ProductImage
                const existingProductImages = await ProductImage.findAll({
                    where: { product_id: productId },
                    transaction: t
                });
                const existingImageUrls = existingProductImages.map(img => img.image_url);
    
                // Обработка удаления изображений
                if (deletedImageUrls.length > 0) {
                    for (const imageUrl of deletedImageUrls) {
                        if (imageUrl) {
                            const imageName = imageUrl.split('/').pop();
                            const imageRecord = await ProductImage.findOne({
                                where: { product_id: productId, image_url: imageUrl },
                                transaction: t
                            });
                            if (imageRecord) {
                                await imageRecord.destroy({ transaction: t });
                                const imagePath = path.join(uploadDir, imageName);
                                fs.unlink(imagePath).catch(err => console.error('Ошибка при удалении файла:', err));
                            }
                        }
                    }
                }
    
                // Обработка новых изображений
                let hasNewImages = false;
                if (req.files && req.files.length > 0) {
                    hasNewImages = true;
                    const newImagePaths = req.files.map(file => `/uploads/images/${file.filename}`);
                    // Если у товара еще нет главного изображения, устанавливаем первое загруженное
                    if (!product.image && newImagePaths.length > 0) {
                        await product.update({ image: newImagePaths[0] }, { transaction: t });
                    }
                    await Promise.all(
                        req.files.map(file =>
                            ProductImage.create({
                                product_id: product.id,
                                image_url: `/uploads/images/${file.filename}`,
                            }, { transaction: t })
                        )
                    );
                }
    
                // Проверяем, остались ли у товара изображения после удаления и добавления
                const remainingProductImagesCount = await ProductImage.count({
                    where: { product_id: productId },
                    transaction: t
                });
    
                // Если не осталось изображений в ProductImage, и не было новых загрузок, удаляем главное изображение в Product
                if (remainingProductImagesCount === 0 && !hasNewImages) {
                    await product.update({ image: null }, { transaction: t });
                } else if (remainingProductImagesCount > 0 && !product.image && hasNewImages) {
                    // Если появились изображения и главное изображение еще не установлено,
                    // устанавливаем главное изображение из первого загруженного (если это еще не было сделано)
                    const firstNewImagePath = req.files[0]?.filename ? `/uploads/images/${req.files[0].filename}` : null;
                    if (firstNewImagePath) {
                        await product.update({ image: firstNewImagePath }, { transaction: t });
                    }
                } else if (remainingProductImagesCount > 0 && product.image && deletedImageUrls.includes(product.image)) {
                    // Если текущее главное изображение было удалено, а другие остались,
                    // можно установить новое главное изображение (например, первое оставшееся)
                    const firstRemainingImage = await ProductImage.findOne({
                        where: { product_id: productId },
                        order: [['id', 'ASC']],
                        transaction: t
                    });
                    if (firstRemainingImage) {
                        await product.update({ image: firstRemainingImage.image_url }, { transaction: t });
                    } else {
                        await product.update({ image: null }, { transaction: t });
                    }
                }
                // Обработка атрибутов
                if (attributes) {
                    let parsedAttributes = {};
                    try {
                        parsedAttributes = JSON.parse(attributes);
                    } catch (e) {
                        console.error('Ошибка парсинга атрибутов:', e);
                        return res.status(400).json({ success: false, message: 'Неверный формат атрибутов JSON.' });
                    }

                    // Удаляем старые атрибуты товара
                    await ProductAttributeValue.destroy({
                        where: { product_id: product.id },
                        transaction: t
                    });

                    // Создаем новые атрибуты на основе полученных данных
                    for (const attrName in parsedAttributes) {
                        const attrValue = parsedAttributes[attrName];

                        // Находим ID атрибута по его имени
                        const productAttribute = await ProductAttribute.findOne({
                            where: { name: attrName },
                            transaction: t
                        });

                        if (productAttribute) {
                            await ProductAttributeValue.create({
                                product_id: product.id,
                                attribute_id: productAttribute.id,
                                value: String(attrValue),
                            }, { transaction: t });
                        } else {
                            console.warn(`Атрибут "${attrName}" не найден в таблице product_attributes. Значение "${attrValue}" не будет сохранено.`);
                            // Решите, как вы хотите обрабатывать несуществующие атрибуты:
                            // - Пропустить и продолжить (как сейчас)
                            // - Создать новый атрибут (требует дополнительной логики)
                            // - Вернуть ошибку
                        }
                    }
                }
            });

            // Получаем обновленный товар со всеми связанными данными
            const updatedProductWithDetails = await Product.findByPk(productId, {
                include: [
                    { model: ProductImage, as: 'images' },
                    {
                        model: ProductAttributeValue,
                        as: 'ProductAttributeValues',
                        include: [{ model: ProductAttribute, as: 'attribute' }]
                    }
                ]
            });

            res.json({
                success: true,
                message: 'Товар успешно обновлен!',
                product: updatedProductWithDetails
            });

        } catch (error) {
            console.error('Ошибка при редактировании товара:', error);
            // Удаляем новые загруженные файлы в случае ошибки
            if (req.files?.length > 0) {
                await Promise.all(
                    req.files.map(file =>
                        fs.unlink(path.join(uploadDir, file.filename)).catch(console.error)
                    )
                );
            }
            res.status(500).json({
                success: false,
                message: 'Не удалось обновить товар',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

module.exports = router;