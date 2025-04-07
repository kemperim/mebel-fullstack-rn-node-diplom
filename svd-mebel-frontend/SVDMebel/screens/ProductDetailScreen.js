import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await axios.get(`http://192.168.8.100:5000/products/product/${productId}`);
        setProduct(res.data);
     
      } catch (err) {
        console.error('Ошибка загрузки данных товара:', err);
        setError('Не удалось загрузить данные товара');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return <Text>Загрузка...</Text>;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {product && (
        <View style={styles.productDetail}>
          {/* Изображения товара */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {product.image && (
              <Image source={{ uri: product.image }} style={styles.productImage} />
            )}
          </ScrollView>

          {/* Название товара */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Цена товара */}
          <Text style={styles.productPrice}>{product.price} руб.</Text>

          {/* Рейтинг товара */}
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.productRating}>{product.rating}</Text>
          </View>

          {/* Описание товара */}
          <Text style={styles.productDescription}>{product.description}</Text>

          {/* Характеристики товара */}
          {product.attributes && product.attributes.length > 0 && (
            <View style={styles.productAttributes}>
              <Text style={styles.attributesTitle}>Характеристики</Text>
              {product.attributes.map((attr, index) => (
                <Text key={index} style={styles.attributeItem}>
                  {attr.name}: {attr.value}
                </Text>
              ))}
            </View>
          )}

          {/* Кнопка добавления в корзину */}
          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>Добавить в корзину</Text>
          </TouchableOpacity>

          {/* Отзывы */}
          <Text style={styles.reviewsTitle}>Отзывы</Text>
          {product.reviews && product.reviews.length > 0 ? (
            <FlatList
              data={product.reviews}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewAuthor}>{item.author}</Text>
                  <Text style={styles.reviewText}>{item.text}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noReviews}>Отзывов нет</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  productDetail: {
    padding: 16,
    backgroundColor: '#fff',
  },
  imagesContainer: {
    marginBottom: 16,
  },
  productImage: {
    width: width - 32,  // Устанавливаем ширину изображения по размеру экрана
    height: 300,
    borderRadius: 10,
    marginRight: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  productPrice: {
    fontSize: 20,
    color: '#FF7043',
    fontWeight: '600',
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  productRating: {
    fontSize: 16,
    color: '#FFD700',
    marginLeft: 5,
  },
  productDescription: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
    lineHeight: 22,
  },
  productAttributes: {
    marginTop: 16,
  },
  attributesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  attributeItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  addToCartButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
  },
  reviewItem: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  noReviews: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProductDetailScreen;
