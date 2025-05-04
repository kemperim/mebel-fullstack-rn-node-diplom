const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("el7674os_svd", "el7674os_svd", "Slabyy_axl228", {
    host: "el7674os.beget.tech",
    dialect: "mysql",
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log("✅ Подключено к базе данных на Beget!"))
    .catch(err => console.error("❌ Ошибка подключения:", err));

module.exports = sequelize;