import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
  
        // Проверка авторизации
        if (token && userId) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
  
        const res = await axios.get(`http://192.168.8.100:5000/products/product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(res.data);
        console.log('Данные товара:', res.data);
      } catch (err) {
        console.error('Ошибка загрузки данных товара:', err);
        setError('Не удалось загрузить данные товара');
      }
    };
  
    const checkProductInCart = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
  
        if (!userId) {
          console.error('User ID is missing');
          return;
        }
  
        // Получаем данные о корзине
        const cartRes = await axios.get(`http://192.168.8.100:5000/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log('Корзина:', cartRes.data);
        const isProductInCart = cartRes.data.some(item => item.productId === productId);
        setIsAdded(isProductInCart);
      } catch (err) {
        console.error('Ошибка при проверке корзины:', err);
        setError('Не удалось проверить корзину');
      }
    };
  
    fetchProductDetails();
    checkProductInCart();
  }, [productId]);
  
  // Обработчик для добавления товара в корзину
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Для добавления в корзину необходимо авторизоваться');
      return;
    }
  
    if (isAdded) {
      alert('Товар уже в корзине');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `http://192.168.8.100:5000/cart/add`,
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log('Ответ от сервера:', response);
  
      if (response.data?.message === 'Товар успешно добавлен в корзину') {
        setIsAdded(true);
        alert('Товар успешно добавлен в корзину');
      } else {
        alert('Не удалось добавить товар в корзину. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину', error?.response || error.message);
      alert('Не удалось добавить товар в корзину. Пожалуйста, попробуйте позже.');
    }
  };
  
  // Кнопка добавления в корзину
  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {product && (
          <View style={styles.productDetail}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {product.image && <Image source={{ uri: product.image }} style={styles.productImage} />}
            </ScrollView>
  
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price} ₽</Text>
  
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.productRating}>{product.rating}</Text>
            </View>
  
            <Text style={styles.productDescription}>{product.description}</Text>
  
            {product.attributes?.length > 0 && (
              <View style={styles.productAttributes}>
                <Text style={styles.attributesTitle}>Характеристики</Text>
                {product.attributes.map((attr, index) => (
                  <Text key={index} style={styles.attributeItem}>
                    {attr.name}: {attr.value}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
  
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addToCartButton, isAdded && styles.addedButton]}
          onPress={handleAddToCart}
          disabled={isAdded || !isAuthenticated} // Проверка авторизации и добавления в корзину
        >
          <Text style={[styles.addToCartText, isAdded && styles.addedText]}>
            {isAdded
              ? 'Товар в корзине'
              : isAuthenticated
              ? 'Добавить в корзину'
              : 'Авторизуйтесь, чтобы добавить в корзину'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}  

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f4fdf7',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  productDetail: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  imagesContainer: {
    marginBottom: 16,
  },
  productImage: {
    width: 320,
    height: 240,
    borderRadius: 12,
    marginRight: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'black',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 22,
    color: '#388e3c',
    fontWeight: '600',
    marginBottom: 10,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productRating: {
    fontSize: 16,
    marginLeft: 6,
    color: '#4CAF50',
  },
  productDescription: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 16,
  },
  productAttributes: {
    marginBottom: 20,
  },
  attributesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  attributeItem: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  addedButton: {
    backgroundColor: '#c8e6c9',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addedText: {
    color: '#388e3c',
  },
});

export default ProductDetailScreen;
