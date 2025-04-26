import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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
      await axios.delete(`http://192.168.92.67:5000/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (error) {
      console.error('Ошибка при удалении товара', error);
    }
  };

  const renderItem = ({ item }) => {
    const isOutOfStock = item.Product.stock_quantity === 0;

    return (
      <Animated.View style={styles.cartItem}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: `http://192.168.92.67:5000${item.Product.image}` }} 
            style={styles.productImage} 
          />
          {isOutOfStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Нет в наличии</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>{item.Product.name}</Text>
            <Text style={styles.productPrice}>{item.Product.price} ₽</Text>
          </View>
          {!isOutOfStock && (
            <View style={styles.controlsRow}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Ionicons name="remove" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.productQuantity}>{item.quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  useFocusEffect(
    useCallback(() => {
      checkAuthentication();
    }, [])
  );

  console.log('Состояние isLoading перед рендером:', isLoading);
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Загрузка корзины...</Text>
      </View>
    );
  }

  console.log('Состояние isAuthenticated перед рендером:', isAuthenticated);
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authContent}>
          <Ionicons name="cart-outline" size={64} color="#4CAF50" />
          <Text style={styles.authTitle}>Корзина недоступна</Text>
          <Text style={styles.authText}>Пожалуйста, авторизуйтесь для доступа к корзине</Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.authButtonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#4CAF50" />
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptyText}>Добавьте товары в корзину</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Каталог')}
          >
            <Text style={styles.shopButtonText}>Перейти в каталог</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Итого:</Text>
              <Text style={styles.totalAmount}>{total} ₽</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('CheckoutScreen')}
            >
              <Ionicons name="arrow-forward" size={24} color="#fff" style={styles.checkoutIcon} />
              <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  authContent: {
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#FF5252',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutIcon: {
    marginRight: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;