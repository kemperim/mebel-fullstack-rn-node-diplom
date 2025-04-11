const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("🔍 Заголовок Authorization:", authHeader);

    // Проверка, что заголовок существует и начинается с 'Bearer '
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ Токен не найден или неправильный формат");
        return res.status(401).json({ message: "Нет токена, авторизация запрещена" });
    }

    // Извлечение токена
    const token = authHeader.split(" ")[1];
    console.log("📜 Извлечённый токен:", token);

    // Проверка на наличие токена
    if (!token) {
        console.log("❌ Токен не найден");
        return res.status(401).json({ message: "Токен отсутствует" });
    }

    console.log("🔍 Проверка токена с секретом:", process.env.JWT_SECRET);

    try {
        // Декодирование и проверка токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Декодированный токен:", decoded);

        // Присваиваем данные о пользователе в объект запроса
        req.user = decoded;

        // Передаем управление следующему middleware
        next();
    } catch (error) {
        console.log("❌ Ошибка валидации токена:", error.message);

        // Обработка разных типов ошибок JWT
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Токен истек" });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Неверный токен" });
        }

        // Если ошибка не связана с токеном, возвращаем общий ответ
        return res.status(500).json({ message: "Ошибка валидации токена" });
    }
};
