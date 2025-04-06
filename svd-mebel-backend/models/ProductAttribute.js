const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных

const ProductAttribute = sequelize.define('ProductAttribute', {
  name: DataTypes.STRING
}, {
  tableName: 'product_attributes',
  timestamps: false,
});

ProductAttribute.associate = (models) => {
  ProductAttribute.hasMany(models.ProductAttributeValue, { foreignKey: 'attribute_id' });
};

module.exports = ProductAttribute;
