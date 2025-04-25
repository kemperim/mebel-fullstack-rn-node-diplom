const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Middleware для обработки JSON-тела запроса с увеличенным лимитом
router.use(express.json({ limit: '10mb' })); // Увеличим лимит, так как изображений может быть несколько

// Определяем путь к папке для сохранения загруженных изображений
const UPLOAD_PATH = path.join(__dirname, '../uploads');

// Убедимся, что папка uploads существует при запуске
fs.mkdir(UPLOAD_PATH, { recursive: true }).catch(console.error);

router.post('/', async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Не переданы изображения для загрузки.' });
    }

    const uploadedFiles = [];

    for (const base64Image of images) {
      if (typeof base64Image === 'string') {
        try {
          const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const timestamp = Date.now();
          const filename = `image_${timestamp}.jpg`; // По умолчанию JPEG

          const filePath = path.join(UPLOAD_PATH, filename);
          await fs.writeFile(filePath, buffer);
          console.log(`Изображение сохранено: ${filePath}`);
          uploadedFiles.push({ filename });
        } catch (error) {
          console.error('Ошибка сохранения одного из изображений:', error);
        }
      } else {
        console.warn('Получены некорректные данные изображения:', base64Image);
      }
    }

    if (uploadedFiles.length > 0) {
      res.status(200).json({ message: `${uploadedFiles.length} изображений успешно загружены и сохранены.`, files: uploadedFiles });
    } else {
      res.status(500).json({ message: 'Не удалось сохранить ни одного из переданных изображений.' });
    }

  } catch (error) {
    console.error('Ошибка обработки загрузки нескольких изображений:', error);
    res.status(500).json({ message: 'Ошибка при загрузке нескольких изображений на сервер.' });
  }
});

module.exports = router;