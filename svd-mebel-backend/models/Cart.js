// models/Cart.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');
const User = require('./User');

class Cart extends Model {}

Cart.init({
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,  
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.NOW
  }
}, {
  sequelize,
  modelName: 'Cart',
  tableName: 'cart',
  timestamps: false // если не используете timestamps
});

// Ассоциации
Cart.belongsTo(Product, { foreignKey: 'product_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Cart;
