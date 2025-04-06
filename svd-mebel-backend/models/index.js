const sequelize = require('../config/db');
const Product = require('./Product');
const ProductAttributeValue = require('./ProductAttributeValue');
const ProductAttribute = require('./ProductAttribute');
const Category = require('./Category');
const Subcategory = require('./Subcategory');

Product.associate({ ProductAttributeValue, ProductAttribute, Category, Subcategory });
ProductAttributeValue.associate({ Product, ProductAttribute });
ProductAttribute.associate({ ProductAttributeValue });
Subcategory.associate({ Category });


module.exports = {
  Product,
  ProductAttributeValue,
  ProductAttribute,
  Category,
  Subcategory
};
