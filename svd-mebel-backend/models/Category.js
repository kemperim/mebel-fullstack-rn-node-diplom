// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Убедитесь, что правильный путь к подключению к базе данных

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'categories',
    timestamps: false,
  }
);

module.exports = Category;  // Это должно быть
