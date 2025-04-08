const sequelize = require('../config/db');

const Product = require('./Product');
const ProductAttributeValue = require('./ProductAttributeValue');
const ProductAttribute = require('./ProductAttribute');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Cart = require('./Cart');
const User = require('./User');  // Правильно импортируем модель User

const models = {
  Product,
  ProductAttributeValue,
  ProductAttribute,
  Category,
  Subcategory,
  Cart,
  User  // Добавляем User в объект models
};

// Инициализация всех ассоциаций
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
