const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'product_images',
  timestamps: false, // Отключаем timestamps, так как поля createdAt и updatedAt не нужны
});

ProductImage.associate = (models) => {
  ProductImage.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
};

module.exports = ProductImage;