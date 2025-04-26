const User = require('../models/User');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

// Создание нового заказа
// Создание нового заказа
const createOrder = async (req, res) => {
  try {
    const { total_price, address, phone_number, products } = req.body;
    const user_id = req.user.userId;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const newOrder = await Order.create({
      user_id,
      total_price,
      address,
      phone_number,
      status: 'Оформлен',
    });

    const orderItems = await Promise.all(products.map(async (product) => {
      const productData = await Product.findByPk(product.product_id);
      if (!productData) {
        console.warn(`Товар с ID ${product.product_id} не найден`);
        return null;
      }

      // Проверяем, достаточно ли товара на складе
      if (productData.stock_quantity < product.quantity) { // <---- Обновлено на stock_quantity
        return res.status(400).json({
          message: `Недостаточно товара "${productData.name}" на складе (доступно: ${productData.stock_quantity}, запрошено: ${product.quantity})`, // <---- Обновлено на stock_quantity
        });
      }

      // Уменьшаем количество товара на складе
      await Product.update(
        { stock_quantity: productData.stock_quantity - product.quantity }, // <---- Обновлено на stock_quantity
        { where: { id: product.product_id } }
      );

      return OrderItem.create({
        order_id: newOrder.id,
        product_id: product.product_id,
        quantity: product.quantity,
        price: productData.price,
      });
    }));

    // Проверяем, были ли ошибки при создании элементов заказа (например, недостаточно товара)
    if (orderItems.some(item => item instanceof Error)) {
      // Если была ошибка, возможно, стоит откатить создание заказа.
      // Это зависит от вашей бизнес-логики.
      await Order.destroy({ where: { id: newOrder.id } });
      return; // Запрос уже обработан с ошибкой внутри map
    }

    const validItems = orderItems.filter(item => item !== null);

    const orderWithItems = await Order.findOne({
      where: { id: newOrder.id },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'image', 'stock_quantity'], // Включаем stock_quantity
          through: {
            attributes: ['quantity', 'price'],
          },
        },
      ],
    });

    res.status(201).json({
      message: 'Заказ успешно создан',
      order: orderWithItems,
    });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании заказа' });
  }
};

// Получение заказов пользователя
const getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const orders = await Order.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'price', 'image'],
          through: {
            attributes: ['quantity', 'price']
          }
        }
      ]
    });

    res.status(200).json({
      message: 'Список заказов пользователя',
      orders
    });
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении заказов' });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;

    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId, // Защита: пользователь может видеть только свои заказы
      },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: [ 'id','name', 'image'],
          through: {
            attributes: ['quantity', 'price'],
          },
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
};
