const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных
const Product = require('./Product'); // Импортируем модель Product
const ProductAttribute = require('./ProductAttribute'); // Импортируем модель ProductAttribute

const ProductAttributeValue = sequelize.define('ProductAttributeValue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products', // Убедитесь, что имя таблицы товаров правильное
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'product_attributes',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'product_attribute_values',
    timestamps: false,
});

ProductAttributeValue.associate = (models) => {
    ProductAttributeValue.belongsTo(models.Product, { foreignKey: 'product_id', onDelete: 'CASCADE' });
    ProductAttributeValue.belongsTo(models.ProductAttribute, { foreignKey: 'attribute_id', onDelete: 'CASCADE', as: 'attribute' }); // Добавлен псевдоним 'attribute'
};

module.exports = ProductAttributeValue;