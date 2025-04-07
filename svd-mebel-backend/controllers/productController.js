const { Product, ProductAttributeValue, ProductAttribute, Subcategory } = require('../models');

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
      image: product.image,
      ar_model_path: product.ar_model_path,
      attributes: product.ProductAttributeValues.map(attrVal => ({
        name: attrVal.ProductAttribute.name,
        value: attrVal.value
      }))
    };

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
};
