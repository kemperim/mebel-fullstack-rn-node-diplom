import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const ProductScreen = ({ route, navigation }) => {
  const { subcategoryId, subcategoryName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      }
    };

    fetchProducts();
  }, [subcategoryId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#FF7043" />;
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.productItem}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} // Переход на страницу товара
          >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.productRating}>{item.rating}</Text>
              </View>
              <Text style={styles.productPrice}>{item.price} руб.</Text>
              <TouchableOpacity style={styles.addToCartButton}>
                <Text style={styles.addToCartText}>Добавить в корзину</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  subcategoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    transform: [{ scale: 0.98 }],
    transition: 'transform 0.2s ease-in-out',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productRating: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#FF7043',
    fontWeight: '600',
    marginBottom: 8,
  },
  addToCartButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ProductScreen;
