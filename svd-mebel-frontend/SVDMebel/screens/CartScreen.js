import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Состояние для проверки авторизации

  const userId = 1; // Заменить на реальный ID пользователя из auth/хранилища

  useFocusEffect(
    useCallback(() => {
      checkAuthentication();  // Проверяем авторизацию при фокусировке на экране
    }, [])
  );

  // Проверка авторизации
  const checkAuthentication = async () => {
    const token = await AsyncStorage.getItem('token');  // Получаем токен из хранилища
    if (token) {
      setIsAuthenticated(true);  // Если токен есть, считаем пользователя авторизованным
      fetchCart();  // Загружаем корзину
    } else {
      setIsAuthenticated(false);  // Если нет токена, считаем пользователя неавторизованным
    }
  };

  // Получение корзины с сервера
  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('token');  // Получаем токен из хранилища
      if (!token) {
        console.log('Нет токена, пользователь не авторизован');
        return;
      }

      const response = await axios.get(`http://192.168.8.100:5000/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },  // Добавляем токен в заголовок
      });

      if (response.data?.length > 0) {
        setCartItems(response.data);
        calculateTotal(response.data);
      } else {
        setCartItems([]);
        setTotal(0);
        console.log('Корзина пуста');
      }
    } catch (error) {
      console.error('Ошибка при получении корзины', error?.response || error.message);
      alert('Не удалось загрузить корзину. Пожалуйста, попробуйте позже.');
    }
  };

  // Подсчёт общей стоимости
  const calculateTotal = (items) => {
    const totalPrice = items.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.Product.price),
      0
    );
    setTotal(totalPrice);
  };

  // Обновление количества товара
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Если количество меньше 1, не продолжаем

    try {
      const token = await AsyncStorage.getItem('token'); // Получаем токен из хранилища

      if (!token) {
        console.log('Нет токена, пользователь не авторизован');
        return; // Возвращаемся, если токен не найден
      }

      // Отправляем запрос для обновления количества товара в корзине
      await axios.put(`http://192.168.8.100:5000/cart/update/${itemId}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` } // Передаем токен в заголовке
      });

      fetchCart(); // Обновляем корзину после успешного обновления количества
    } catch (error) {
      console.error('Ошибка при обновлении количества товара', error);
    }
  };

  // Удаление товара из корзины
  const removeItem = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem('token');  // Получаем токен из хранилища

      if (!token) {
        console.log('Нет токена, пользователь не авторизован');
        return;  // Возвращаемся, если токен не найден
      }

      // Отправляем запрос для удаления товара из корзины
      await axios.delete(`http://192.168.8.100:5000/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` } // Передаем токен в заголовке
      });

      fetchCart(); // Обновляем корзину после успешного удаления товара
    } catch (error) {
      console.error('Ошибка при удалении товара', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.Product.image }} style={styles.productImage} />

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>{item.Product.name}</Text>
          <Text style={styles.productPrice}>{item.Product.price} ₽</Text>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Text style={styles.quantityText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.productQuantity}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Text style={styles.quantityText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyCartText}>Пожалуйста, авторизуйтесь для доступа к корзине.</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('Login')} // Направление на экран авторизации
        >
          <Text style={styles.authButtonText}>Перейти к авторизации</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyCartText}>Корзина пуста</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Итого: {total} ₽</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutButtonText}>Перейти к оформлению</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F5F0', // мягкий зелёный фон
    justifyContent: 'space-between',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    flexShrink: 1,
    maxWidth: '70%',
  },

  productPrice: {
    fontSize: 18,
    color: '#3C8D5B', // насыщенный зелёный
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F2E6', // светло-зелёный фон
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#3C8D5B',
    borderRadius: 6,
  },
  quantityText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  productQuantity: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#2F4F2F',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'red', // мягкий зелёный для удаления
    borderRadius: 8,
  },
  footer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  totalContainer: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#E1F0E1',
    borderRadius: 12,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  checkoutButton: {
    backgroundColor: '#3C8D5B',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#6B8E6B',
    textAlign: 'center',
    marginTop: 40,
  },
  authButton: {
    backgroundColor: '#3C8D5B',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CartScreen;
