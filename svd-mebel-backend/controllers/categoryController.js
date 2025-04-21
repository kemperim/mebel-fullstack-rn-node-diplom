
const { Category, Subcategory } = require('../models'); // Импортируем модели

exports.getAllCategories = async (req, res) => {
  try {
    // Запрос всех подкатегорий
    const subcategories = await Subcategory.findAll();

    // Если подкатегории не найдены
    if (subcategories.length === 0) {
      return res.status(404).json({ message: 'Подкатегории не найдены' });
    }

    // Возвращаем все подкатегории
    res.json(subcategories);
  } catch (error) {
    console.error('Ошибка получения подкатегорий:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
};

exports.getSubcategoriesByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const subcategories = await Subcategory.findAll({
      where: { category_id: categoryId },
      attributes: ['id', 'name'],
    });

    if (subcategories.length === 0) {
      return res.status(404).json({ message: `Подкатегории для категории с ID ${categoryId} не найдены` });
    }

    res.json(subcategories);
  } catch (error) {
    console.error(`Ошибка получения подкатегорий для категории ${categoryId}:`, error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
};