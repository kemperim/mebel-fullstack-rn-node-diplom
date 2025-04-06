// models/Subcategory.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'subcategories',
  timestamps: false,
});

// 👇 Добавим метод для ассоциации
Subcategory.associate = ({ Category }) => {
  Subcategory.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category',
  });
};

module.exports = Subcategory;
