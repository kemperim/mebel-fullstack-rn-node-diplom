
module.exports = (req, res, next) => {
    try {
      if (req.user && req.user.role === 'admin') {
        return next();
      } else {
        return res.status(403).json({ message: 'Доступ запрещён. Только для админов.' });
      }
    } catch (err) {
      console.error('Ошибка в isAdmin middleware:', err);
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
  };
  