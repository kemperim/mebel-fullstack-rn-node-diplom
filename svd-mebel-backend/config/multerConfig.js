const multer = require('multer');
const path = require('path');

// Определяем хранилище для загружаемых файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Указываем папку, куда будут сохраняться файлы
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя для файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
        // file.fieldname - это имя поля формы, через которое был отправлен файл ('image' в вашем случае)
        // uniqueSuffix - временная метка и случайное число для уникальности
        // fileExtension - расширение оригинального файла
    }
});

// Фильтр для проверки типа файла (только изображения)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        // Разрешаем загрузку файла
        cb(null, true);
    } else {
        // Запрещаем загрузку файла, передавая false и сообщение об ошибке
        cb(null, false);
        req.fileValidationError = 'Разрешены только файлы изображений (jpeg, png, gif).';
    }
};

// Создаем экземпляр multer с настроенным хранилищем и фильтром
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Максимальный размер файла 5MB (в байтах)
    }
});

module.exports = upload;