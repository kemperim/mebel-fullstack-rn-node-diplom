import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator, // Импортируем ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  const userId = 0; // Заменить на реальный ID пользователя

  const checkAuthentication = async () => {
    console.log('checkAuthentication вызван');
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      console.log('Токен найден:', token);
      setIsAuthenticated(true);
      fetchCart();
    } else {
      console.log('Токен не найден');
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const fetchCart = async () => {
    console.log('fetchCart вызван');
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('fetchCart: токен отсутствует');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`http://192.168.92.67:5000/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
      if (error?.response?.status === 401) {
        console.log('fetchCart: получен статус 401 - токен истек');
        await AsyncStorage.removeItem('token');
        setIsAuthenticated(false);
       
      } else {
        alert('Не удалось загрузить корзину. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
      console.log('fetchCart: isLoading установлен в false');
    }
  };

  const calculateTotal = (items) => {
    const totalPrice = items.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.Product.price),
      0
    );
    setTotal(totalPrice);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Нет токена, пользователь не авторизован');
        return;
      }
      await axios.put(`http://192.168.92.67:5000/cart/update/${itemId}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (error) {
      console.error('Ошибка при обновлении количества товара', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Нет токена, пользователь не авторизован');
        return;
      }
      await axios.delete(`http://192.168.8.100:5000/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
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

  useFocusEffect(
    useCallback(() => {
      checkAuthentication();
    }, [])
  );

  console.log('Состояние isLoading перед рендером:', isLoading);
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3C8D5B" />
      </View>
    );
  }

  console.log('Состояние isAuthenticated перед рендером:', isAuthenticated);
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyCartText}>Пожалуйста, авторизуйтесь для доступа к корзине.</Text>
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

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Итого: {total} ₽</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('CheckoutScreen')}
          >
            <Text style={styles.checkoutButtonText}>Перейти к оформлению</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F5F0',
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
    color: '#3C8D5B',
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
    backgroundColor: '#E6F2E6',
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
    backgroundColor: 'red',
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
    color: 'gray',
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