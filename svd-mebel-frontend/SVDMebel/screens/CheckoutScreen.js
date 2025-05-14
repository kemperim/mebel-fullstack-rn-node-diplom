import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const CheckoutScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null); // Состояние для хранения данных пользователя

  const checkAuthentication = async () => {
    console.log('CheckoutScreen: checkAuthentication вызван');
    setIsAuthLoading(true);
    const token = await AsyncStorage.getItem('token');
    const storedUserId = await AsyncStorage.getItem('userId');
    if (token && storedUserId) {
      console.log('CheckoutScreen: Токен найден:', token);
      console.log('CheckoutScreen: UserId найден:', storedUserId);
      setUserId(storedUserId);
      setIsAuthenticated(true);
      fetchCart(storedUserId);
      fetchUserData(token); // Передаем токен для получения данных пользователя
    } else {
      console.log('CheckoutScreen: Токен или UserId не найден');
      setIsAuthenticated(false);
    }
    setIsAuthLoading(false);
  };

  const fetchUserData = async (token) => {
    console.log('CheckoutScreen: fetchUserData вызван');
    try {
      const response = await axios.get("http://192.168.217.67:5000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setName(response.data.name || ""); // Устанавливаем имя из response.data
      setAddress(response.data.address || "");
      setPhone(response.data.phone || "");
    } catch (error) {
      console.error('CheckoutScreen: Ошибка при получении данных пользователя', error?.response?.data || error.message);
      Alert.alert('Ошибка', 'Не удалось загрузить данные пользователя.');
    }
  };

  const fetchCart = async (currentUserId) => {
    console.log('CheckoutScreen: fetchCart вызван с userId:', currentUserId);
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token || !currentUserId) {
        console.log('CheckoutScreen: fetchCart - токен или userId отсутствуют');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://192.168.217.67:5000/cart/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data || []);
    } catch (error) {
      console.error('CheckoutScreen: Ошибка при получении корзины', error?.response || error.message);
      if (error?.response?.status === 401) {
        console.log('CheckoutScreen: fetchCart - получен статус 401 - токен истек');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userId');
        setIsAuthenticated(false);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить корзину. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://192.168.217.67:5000/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userId) {
        fetchCart(userId);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить товар');
    }
  };

  const handleOrder = async () => {
    if (!isAuthenticated) {
      Alert.alert('Ошибка', 'Пожалуйста, авторизуйтесь для оформления заказа.');
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Ошибка', 'Корзина пуста');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (userId) {
        console.log('CheckoutScreen: User ID перед отправкой заказа:', userId);

        const totalPrice = cartItems.reduce((sum, item) => sum + item.Product.price * item.quantity, 0);
        console.log('CheckoutScreen: Общая стоимость:', totalPrice);
        console.log('CheckoutScreen: Данные корзины для заказа:', cartItems); // Проверка структуры cartItems

        await axios.post('http://192.168.217.67:5000/orders/create', {
          user_id: userId, // Убедитесь, что на сервере вы получаете user_id из req.user
          total_price: totalPrice,
          address: address,
          phone_number: phone,
          products: cartItems.map(item => ({ // Формируем массив products
            product_id: item.Product.id,
            quantity: item.quantity,
          })),
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Alert.alert('Успех', 'Заказ успешно оформлен!');
        setName('');
        setPhone('');
        setAddress('');
        setCartItems([]);
        navigation.navigate('Home');
      } else {
        Alert.alert('Ошибка', 'User ID не определен. Пожалуйста, авторизуйтесь.');
      }
    } catch (error) {
      console.log('CheckoutScreen: Ошибка при оформлении заказа:', error.response?.data || error.message);
      Alert.alert('Ошибка', 'Не удалось оформить заказ');
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuthentication();
    }, [])
  );

  if (isAuthLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3C8D5B" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyCart}>Пожалуйста, авторизуйтесь для оформления заказа.</Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.authButtonText}>Перейти к авторизации</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Оформление заказа</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3C8D5B" />
      ) : (
        <>
          {cartItems.length === 0 ? (
            <Text style={styles.emptyCart}>Корзина пуста</Text>
          ) : (
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <Text>{item.Product.name} x{item.quantity}</Text>
                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Text style={styles.removeText}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Имя"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Телефон"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Адрес доставки"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.button, cartItems.length === 0 && styles.buttonDisabled]}
            onPress={handleOrder}
            disabled={cartItems.length === 0 || !isAuthenticated}
          >
            <Text style={styles.buttonText}>Создать заказ</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F0F5F0', justifyContent: 'space-between' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2D4B3C',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#3C8D5B',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ABBA2',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  removeText: {
    color: 'red',
    fontSize: 14,
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
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

export default CheckoutScreen;