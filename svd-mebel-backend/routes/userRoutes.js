const express = require('express');
const authenticateUser = require('../middleware/authMiddleware');
const { User } = require('../models'); // Импорт из index.js

const router = express.Router();

// Получение профиля
router.get('/profile', authenticateUser, (req, res) => {
  res.json({ message: 'Данные профиля', user: req.user });


});

// Обновление адреса
router.put('/profile/address', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.userId; // Замените id на userId
      const { address } = req.body;
  
      // Обновляем адрес пользователя
      const [updatedRowsCount, updatedUser] = await User.update(
        { address }, // Новый адрес
        { where: { id: userId }, returning: true } // Обновляем по userId
      );
  
      if (updatedRowsCount === 0) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      res.json({ message: 'Адрес обновлен', user: updatedUser[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка при обновлении адреса' });
    }
  });
  
  router.put('/profile/phone', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.userId; // Замените id на userId
      const { phone } = req.body; // Получаем новый номер телефона из тела запроса
  
      // Обновляем номер телефона пользователя
      const [updatedRowsCount, updatedUser] = await User.update(
        { phone }, // Новый номер телефона
        { where: { id: userId }, returning: true } // Обновляем по userId
      );
  
      if (updatedRowsCount === 0) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      res.json({ message: 'Номер телефона обновлен', user: updatedUser[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка при обновлении номера телефона' });
    }
  });
  

module.exports = router;
