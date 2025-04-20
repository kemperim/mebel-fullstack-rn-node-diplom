const { Product, ProductAttributeValue, ProductAttribute, Subcategory, ProductImage } = require('../models');
// Получение товаров по подкатегории (существующий метод)
exports.getProductsBySubcategory = async (req, res) => {
  const subcategoryId = req.params.subcategoryId;

  try {
    const products = await Product.findAll({
      where: { subcategory_id: subcategoryId },
      include: [
        {
          model: ProductAttributeValue,
          include: [
            {
              model: ProductAttribute,
              attributes: ['name']
            }
          ]
        }
      ]
    });

    // Форматирование данных
    const result = products.map(product => {
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        image: product.image,
        ar_model_path: product.ar_model_path,
        attributes: product.ProductAttributeValues.map(attrVal => ({
          name: attrVal.ProductAttribute.name,
          value: attrVal.value
        }))
      };
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении товаров' });
  }
};

// Получение товара по id
exports.getProductById = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findOne({
      where: { id: productId },
      include: [
        {
          model: ProductAttributeValue,
          include: [
            {
              model: ProductAttribute,
              attributes: ['name']
            }
          ]
        },
        {
          model: ProductImage,
          as: 'images', // Псевдоним для связи с изображениями
          attributes: ['image_url']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Форматирование данных
    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      image: product.image, // Пока оставляем, но в будущем можно убрать
      ar_model_path: product.ar_model_path,
      attributes: product.ProductAttributeValues.map(attrVal => ({
        name: attrVal.ProductAttribute.name,
        value: attrVal.value
      })),
      images: product.images.map(img => img.image_url) // Добавляем массив URL изображений
    };

    res.json(result);

    console.log('Товар с изображениями (по ID):', JSON.stringify(product, null, 2));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
};