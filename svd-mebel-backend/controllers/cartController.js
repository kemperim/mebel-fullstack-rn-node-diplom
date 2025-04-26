const { Cart, Product, User } = require('../models');

// Добавить товар в корзину
const addToCart = async (req, res) => {
  try {
    const { productId } = req.body; // предполагаем, что передается только productId
    const { userId } = req.user; // Извлекаем userId из токена

    // Проверяем, существует ли товар и пользователь
    const product = await Product.findByPk(productId);
    const user = await User.findByPk(userId);

    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем, не добавлен ли товар в корзину
    const existingCartItem = await Cart.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existingCartItem) {
      return res.status(400).json({ message: 'Товар уже добавлен в корзину' });
    }

    // Добавляем товар в корзину
    const cartItem = await Cart.create({
      user_id: userId,
      product_id: productId
    });

    return res.status(201).json({
      message: 'Товар успешно добавлен в корзину',
      cartItem
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка добавления товара в корзину' });
  }
};

// Получить содержимое корзины для пользователя
const getCart = async (req, res) => {
  try {
    const { userId } = req.user; // Извлекаем userId из токена

    // Получаем все товары в корзине этого пользователя
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: {
        model: Product,
        attributes: ['id', 'name', 'price', 'image', 'stock_quantity'], // Включаем stock_quantity
      }
    });

    // Если корзина пуста, возвращаем пустой массив и статус 200
    if (cartItems.length === 0) {
      return res.status(200).json([]); // Возвращаем пустой массив
    }

    return res.status(200).json(cartItems); // Если есть товары, возвращаем их
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка получения содержимого корзины' });
  }
};

// Удалить товар из корзины
const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params; // Получаем itemId из параметра пути
    const { userId } = req.user; // Извлекаем userId из токена

    // Проверяем, существует ли товар в корзине этого пользователя
    const cartItem = await Cart.findOne({
      where: { id: itemId, user_id: userId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Товар не найден в корзине' });
    }

    // Удаляем товар из корзины
    await cartItem.destroy();

    return res.status(200).json({
      message: 'Товар успешно удален из корзины',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка при удалении товара из корзины' });
  }
};

// Очистить корзину пользователя
const clearCart = async (req, res) => {
  try {
    const { userId } = req.user; // Извлекаем userId из токена

    // Удаляем все товары из корзины пользователя
    const deletedCount = await Cart.destroy({
      where: { user_id: userId }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Корзина пуста' });
    }

    return res.status(200).json({ message: 'Корзина очищена' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка очищения корзины' });
  }
};

// Обновить количество товара в корзине
const updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const { userId } = req.user; // Извлекаем userId из токена

    // Проверка, что количество товара корректно (больше 0)
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Количество товара должно быть больше нуля' });
    }

    // Проверяем, существует ли товар в корзине по itemId для этого пользователя
    const cartItem = await Cart.findOne({
      where: { id: itemId, user_id: userId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Товар не найден в корзине' });
    }

    // Обновляем количество товара в корзине
    cartItem.quantity = quantity;

    // Сохраняем изменения
    await cartItem.save();

    return res.status(200).json({
      message: 'Количество товара в корзине обновлено',
      cartItem
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка обновления товара в корзине' });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeItem,
  clearCart,
  updateQuantity,
};
