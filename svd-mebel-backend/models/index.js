const sequelize = require('../config/db');

const Product = require('./Product');
const ProductAttributeValue = require('./ProductAttributeValue');
const ProductAttribute = require('./ProductAttribute');
const Category = require('./Category');
const Subcategory = require('./Subcategory');

const models = {
  Product,
  ProductAttributeValue,
  ProductAttribute,
  Category,
  Subcategory
};

// Инициализация всех ассоциаций
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
