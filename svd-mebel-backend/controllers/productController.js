const {
  Product,
  ProductAttributeValue,
  ProductAttribute,
  Subcategory,
  ProductImage
} = require('../models');

// Получение товаров по подкатегории
exports.getProductsBySubcategory = async (req, res) => {
  const subcategoryId = req.params.subcategoryId;

  try {
    const products = await Product.findAll({
      where: { subcategory_id: subcategoryId },
      include: [
        {
          model: ProductAttributeValue,
          as: 'ProductAttributeValues',
          include: [
            {
              model: ProductAttribute,
              as: 'attribute',
              attributes: ['name']
            }
          ]
        }
      ]
    });

    const result = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      image: product.image,
      ar_model_path: product.ar_model_path,
      attributes: (product.ProductAttributeValues || []).map(attrVal => ({
        name: attrVal.attribute.name,
        value: attrVal.value
      }))
    }));

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
          as: 'ProductAttributeValues',
          include: [
            {
              model: ProductAttribute,
              as: 'attribute',
              attributes: ['name']
            }
          ]
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['image_url']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      image: product.image,
      ar_model_path: product.ar_model_path,
      attributes: (product && product.ProductAttributeValues || []).map(attrVal => ({
        name: attrVal.attribute.name,
        value: attrVal.value
      })),
      images: product.images.map(img => img.image_url)
    };

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
};

// Получение всех товаров
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['image_url']
        }
      ]
    });

    const result = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      image: product.image,
      ar_model_path: product.ar_model_path,
      images: product.images.map(img => img.image_url)
    }));

    res.json(result);
  } catch (err) {
    console.error('Ошибка при получении всех товаров:', err);
    res.status(500).json({ message: 'Ошибка при получении всех товаров' });
  }
};
