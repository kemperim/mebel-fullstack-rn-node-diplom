import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false); // Состояние для отслеживания, был ли добавлен товар в корзину
  const [userId, setUserId] = useState(1); // Предполагаем, что ID пользователя доступен
  const [cart, setCart] = useState([]); // Для хранения данных корзины

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

    const checkProductInCart = async () => {
      try {
        const res = await axios.get(`http://192.168.8.100:5000/cart/${userId}`);
        const productInCart = res.data.find(item => item.product_id === productId); // Проверяем, есть ли товар в корзине
        if (productInCart) {
          setIsAdded(true); // Если товар есть, ставим флаг, что он добавлен
        }
        setCart(res.data); // Сохраняем данные корзины
      } catch (err) {
        console.error('Ошибка загрузки корзины:', err);
      }
    };

    fetchProductDetails();
    checkProductInCart(); // Проверяем корзину

  }, [productId, userId]);

  const handleAddToCart = async () => {
    if (product && !isAdded) {
      try {
        const res = await axios.post('http://192.168.8.100:5000/cart/add', {
          productId: product.id,
          userId: userId,
        });
        if (res.status === 201) {
          setIsAdded(true); // Обновляем состояние, чтобы показать, что товар добавлен
          setCart([...cart, product]); // Добавляем товар в корзину
        }
      } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error.response.data);
        setError('Не удалось добавить товар в корзину');
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FF7043" style={{ marginTop: 100 }} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

            {/* Рейтинг */}
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.productRating}>{product.rating}</Text>
            </View>

            {/* Описание */}
            <Text style={styles.productDescription}>{product.description}</Text>

            {/* Характеристики */}
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

      {/* Фиксированная кнопка */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.addToCartButton, isAdded && { backgroundColor: '#ddd' }]} 
          onPress={handleAddToCart} 
          disabled={isAdded} // Отключаем кнопку, если товар уже добавлен
        >
          <Text style={styles.addToCartText}>
            {isAdded ? 'Товар добавлен в корзину' : 'Добавить в корзину'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingBottom: 100, // место для кнопки
  },
  productDetail: {
    padding: 16,
    backgroundColor: '#fff',
  },
  imagesContainer: {
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  addToCartButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
