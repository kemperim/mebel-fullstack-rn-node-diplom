const sequelize = require('../config/db');

const Product = require('./Product');
const ProductAttributeValue = require('./ProductAttributeValue');
const ProductAttribute = require('./ProductAttribute');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Cart = require('./Cart');
const User = require('./User');
const ProductImage = require('./ProductImage');
const Order = require('./Order');
const OrderItem = require('./OrderItem')


const models = {
  sequelize: sequelize,
  Product,
  ProductAttributeValue,
  ProductAttribute,
  Category,
  Subcategory,
  Cart,
  User,
  ProductImage,
  Order,
  OrderItem,

};


// Применяем ассоциации, если они есть
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
