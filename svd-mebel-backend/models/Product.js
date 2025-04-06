const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // Можно оставить пустым, если описание не обязательно
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ar_model_path: {
    type: DataTypes.STRING,
    allowNull: true, // если модель AR не обязательна
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true, // если картинка не обязательна
  },
}, {
  tableName: 'products',
  timestamps: false,
});

Product.associate = (models) => {
  Product.belongsTo(models.Category, { foreignKey: 'category_id' });
  Product.belongsTo(models.Subcategory, { foreignKey: 'subcategory_id' });
  Product.hasMany(models.ProductAttributeValue, { foreignKey: 'product_id' });
};

module.exports = Product; // Экспортируем саму модель
