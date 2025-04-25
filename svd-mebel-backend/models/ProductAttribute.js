const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных

const ProductAttribute = sequelize.define('ProductAttribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('text', 'number', 'select', 'date'),
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories', // Убедитесь, что имя таблицы категорий правильное
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    subcategory_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'subcategories', // Убедитесь, что имя таблицы подкатегорий правильное
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
}, {
    tableName: 'product_attributes',
    timestamps: false,
});

ProductAttribute.associate = (models) => {
    ProductAttribute.hasMany(models.ProductAttributeValue, { foreignKey: 'attribute_id', onDelete: 'CASCADE' });
    ProductAttribute.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    ProductAttribute.belongsTo(models.Subcategory, { foreignKey: 'subcategory_id', as: 'subcategory' });
    
};

module.exports = ProductAttribute;