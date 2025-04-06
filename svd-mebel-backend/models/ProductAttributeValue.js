const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных

const ProductAttributeValue = sequelize.define('ProductAttributeValue', {
  value: DataTypes.STRING
}, {
  tableName: 'product_attribute_values',
  timestamps: false,
});

ProductAttributeValue.associate = (models) => {
  ProductAttributeValue.belongsTo(models.Product, { foreignKey: 'product_id' });
  ProductAttributeValue.belongsTo(models.ProductAttribute, { foreignKey: 'attribute_id' });
};

module.exports = ProductAttributeValue;
