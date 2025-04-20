const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User"); // Добавляем импорт модели User
const Product = require("./Product"); // Импортируем модель Product
const OrderItem = require("./OrderItem"); // Импортируем модель OrderItem

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  total_price: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "completed", "canceled"), defaultValue: "pending" },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },          // Новый столбец
  phone_number: { type: DataTypes.STRING, allowNull: false },      // Новый столбец
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW }
}, {
  timestamps: false,
  tableName: "orders"
});

Order.associate = (models) => {
  Order.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  Order.belongsToMany(models.Product, {
    through: models.OrderItem,
    foreignKey: "order_id",
    otherKey: "product_id",
    as: "products"
  });
};

module.exports = Order;