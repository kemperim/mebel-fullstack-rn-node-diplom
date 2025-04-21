const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./Order");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verification_code: { type: DataTypes.STRING, allowNull: true }
}, { 
  timestamps: false, 
  tableName: "users" 
});

// Ассоциации
User.associate = (models) => {
  // Один пользователь может иметь несколько заказов
  User.hasMany(models.Order, { foreignKey: "user_id", as: "orders" }); 
};

module.exports = User;
