// config/multerConfig.js
const multer = require('multer');
const path = require('path');

// Настройка для хранения загруженных файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images'); // Папка для хранения изображений
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Добавление времени к имени файла
  }
});

// Инициализация multer с настройками
const upload = multer({ storage });

module.exports = upload; // Экспортируем multer как объект
