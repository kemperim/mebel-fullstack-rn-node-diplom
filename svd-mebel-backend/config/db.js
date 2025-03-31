const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("svd_mebel", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log("✅ Подключено к базе данных!"))
    .catch(err => console.error("❌ Ошибка подключения:", err));

module.exports = sequelize;
