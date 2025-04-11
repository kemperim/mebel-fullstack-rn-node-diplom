import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const ProductScreen = ({ route, navigation }) => {
  const { subcategoryId } = route.params;
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://192.168.8.100:5000/products/products/${subcategoryId}`);
        setProducts(res.data);
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        setError('Не удалось загрузить товары');
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchProducts();
  }, [subcategoryId]);

  const handleAddToCart = async (product) => {
    const isAlreadyInCart = cart.some(item => item.id === product.id);
    if (!isAlreadyInCart) {
      try {
        const res = await axios.post('http://192.168.8.100:5000/cart/add', {
          productId: product.id,
          userId: 1, // Здесь замените на актуальный userId
        });

        if (res.status === 201) {
          setCart(prevCart => [...prevCart, product]);
        }
      } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error);
        setError('Не удалось добавить товар в корзину');
      }
    }
  };

  const renderItem = ({ item }) => {
    const isInCart = cart.some(cartItem => cartItem.id === item.id);

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#AED581" />
            <Text style={styles.productRating}>{item.rating}</Text>
          </View>
          <Text style={styles.productPrice}>{item.price} руб.</Text>

          <TouchableOpacity
            style={[styles.addToCartButton, isInCart && styles.buttonDisabled]}
            onPress={() => handleAddToCart(item)}
            disabled={isInCart}
          >
            <Text style={styles.addToCartText}>
              {isInCart ? 'В корзине' : 'Добавить в корзину'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F1F8E9',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: '#E8F5E9',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginBottom: 6,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productRating: {
    fontSize: 14,
    color: 'black',
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  addToCartButton: {
    backgroundColor: '#81C784',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default ProductScreen;
