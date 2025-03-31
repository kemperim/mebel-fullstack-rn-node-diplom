const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("🔍 Заголовок Authorization:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ Токен не найден или неправильный формат");
        return res.status(401).json({ message: "Нет токена, авторизация запрещена" });
    }

    const token = authHeader.split(" ")[1];
    console.log("📜 Извлечённый токен:", token);
    console.log("🔍 Проверка токена с секретом:", process.env.JWT_SECRET);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Декодированный токен:", decoded);

        req.user = decoded; // ✅ Здесь должен быть userId
        next();
    } catch (error) {
        console.log("❌ Ошибка валидации токена:", error.message);
        res.status(401).json({ message: "Неверный токен" });
    }
};
