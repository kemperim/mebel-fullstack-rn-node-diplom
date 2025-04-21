const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require('../middleware/isAdmin');
const { Order, User, Product } = require('../models');

// Проверка на админа
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Нет доступа" });
  }
  next();
};

// Получить всех пользователей
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Редактирование пользователя (только админ)
router.get("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
  
      console.log("📡 Отправка данных пользователя:", user.toJSON()); // ✅ Лог перед отправкой
  
      res.json(user);
    } catch (error) {
      console.error("Ошибка получения пользователя:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
  
// Обновление данных пользователя (только админ)
router.put("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, email, role, phone, address } = req.body;
  
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
  
      // Обновляем данные пользователя
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      user.phone = phone || user.phone;
      user.address = address || user.address;
  
      await user.save();
  
      console.log("✅ Пользователь обновлен:", user.toJSON());
      res.json({ message: "Данные пользователя обновлены", user });
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
  
// Удаление пользователя (только админ)
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
  
      await user.destroy();
      res.json({ message: "Пользователь удален" });
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });



  router.get('/admin/orders', authMiddleware, async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [
          { 
            model: User, 
            as: 'user',  // Используем alias 'user'
            attributes: ['id', 'name']  // Указываем, какие поля нужны
          },
          { 
            model: Product, 
            as: 'products',  // Используем alias 'products'
            attributes: ['id', 'name']  // Указываем, какие поля нужны
          }
        ],
        order: [['created_at', 'DESC']],  // Сортировка по дате создания
      });
      res.json({ orders });
    } catch (err) {
      console.error('Ошибка загрузки заказов', err);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  });

  const ORDER_STATUSES = ['Новый', 'В обработке', 'Доставляется', 'Завершён', 'Отменён'];

  
  router.put('/admin/orders/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
  
    order.status = status;
    await order.save();
  
    res.json({ message: 'Order updated', order });
  });
  
  

module.exports = router;
