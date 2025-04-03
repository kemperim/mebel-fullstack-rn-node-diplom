// models/Subcategory.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных

// Определение модели Subcategory
const Subcategory = sequelize.define('Subcategory', {
  // Указываем поля таблицы
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
}, {
  // Указываем имя таблицы вручную (если она называется subcategories)
  tableName: 'subcategories',
  timestamps: false, // Если в таблице нет полей createdAt, updatedAt
});

module.exports = { Subcategory };
