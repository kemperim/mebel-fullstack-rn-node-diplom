// controllers/productController.js
const { Product, ProductAttributeValue, ProductAttribute, Subcategory } = require('../models');

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

    // Форматирование
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
