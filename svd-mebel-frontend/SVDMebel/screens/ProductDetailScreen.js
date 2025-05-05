import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, FlatList, Linking } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = 60;

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingCart, setIsCheckingCart] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sliderRef = useRef(null);
  const thumbnailRef = useRef(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        if (token && userId) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }

        const res = await axios.get(`http://192.168.230.67:5000/products/product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(res.data);
        console.log('Данные товара:', res.data);
      } catch (err) {
        console.error('Ошибка загрузки данных товара:', err);
        setError('Не удалось загрузить данные товара');
      } finally {
        setLoading(false);
      }
    };

    const checkProductInCart = async () => {
      setIsCheckingCart(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        if (!userId) {
          console.error('User ID is missing');
          return;
        }

        const cartRes = await axios.get(`http://192.168.230.67:5000/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Корзина:', cartRes.data);
        console.log('productId текущего товара:', productId);
        const isProductInCart = cartRes.data.some(item => item.product_id === productId);
        setIsAdded(isProductInCart);
      } catch (err) {
        console.error('Ошибка при проверке корзины:', err);
        setError('Не удалось проверить корзину');
      } finally {
        setIsCheckingCart(false);
      }
    };

    fetchProductDetails();
    if (isAuthenticated) {
      checkProductInCart();
    } else {
      setIsCheckingCart(false);
    }
  }, [productId, isAuthenticated]);

  const isOutOfStock = product?.stock_quantity === 0;

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
        `http://192.168.230.67:5000/cart/add`,
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

  const scrollToIndex = (index) => {
    setCurrentImageIndex(index);
    sliderRef.current?.scrollToIndex({ index, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentImageIndex(index);
      thumbnailRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5
      });
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderImageItem = ({ item }) => (
    <View style={styles.sliderItem}>
      <Image
        source={{ uri: `http://192.168.230.67:5000${item}` }}
        style={styles.productImage}
        resizeMode="contain"
      />
    </View>
  );

  const renderThumbnail = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => scrollToIndex(index)}
      style={[
        styles.thumbnailContainer,
        currentImageIndex === index && styles.thumbnailContainerActive
      ]}
    >
      <Image
        source={{  uri: `http://192.168.230.67:5000${item}`}}
        style={styles.thumbnail}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const handleArView = () => {
    if (product?.ar_model_path) {
      const arUrl = `https://192.168.230.67:443/web/ar.html?model=${encodeURIComponent(product.ar_model_path)}`;
      Linking.openURL(arUrl).catch(err => console.error('An error occurred opening the AR link:', err));
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {product && (
          <View style={styles.productDetail}>
            {product.images && product.images.length > 0 ? (
              <View style={styles.sliderContainer}>
                <FlatList
                  ref={sliderRef}
                  data={product.images}
                  renderItem={renderImageItem}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewConfigRef}
                />
                <View style={styles.thumbnailGallery}>
                  <FlatList
                    ref={thumbnailRef}
                    data={product.images}
                    renderItem={renderThumbnail}
                    keyExtractor={(item, index) => `thumb-${index}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbnailList}
                  />
                </View>
              </View>
            ) : product.image ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            <View style={styles.productInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.productName}>{product.name}</Text>
              </View>
              <View style={styles.priceContainer}>
                <View style={styles.priceTag}>
                  <Text style={styles.productPrice}>{product.price} ₸</Text>
                </View>
              </View>

              <View style={styles.stockContainer}>
                <View style={styles.stockIconContainer}>
                  <Ionicons name="cube" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.stockText}>
                  В наличии: {product.stock_quantity} шт.
                </Text>
              </View>

              <View style={styles.descriptionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text" size={20} color="#4CAF50" />
                  <Text style={styles.descriptionTitle}>Описание</Text>
                </View>
                <View style={styles.descriptionBox}>
                  <Text style={styles.productDescription}>{product.description}</Text>
                </View>
              </View>

              {product.attributes?.length > 0 && (
                <View style={styles.attributesContainer}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="list" size={20} color="#4CAF50" />
                    <Text style={styles.attributesTitle}>Характеристики</Text>
                  </View>
                  <View style={styles.attributesBox}>
                    {product.attributes.map((attr, index) => (
                      <View key={index} style={styles.attributeItem}>
                        <View style={styles.attributeNameContainer}>

                          <Text style={styles.attributeName}>{attr.name}</Text>
                        </View>
                        <Text style={styles.attributeValue}>{attr.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {product?.ar_model_path && (
                <TouchableOpacity style={styles.arButton} onPress={handleArView}>
                  <Ionicons name="cube-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.arButtonText}>Просмотр в AR</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isAdded && styles.addedButton,
            isOutOfStock && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={isAdded || !isAuthenticated || isCheckingCart || isOutOfStock}
        >
          <Ionicons
            name={isAdded ? "checkmark-circle" : "cart"}
            size={20}
            color={isAdded ? "#757575" : "#FFFFFF"}
            style={styles.cartIcon}
          />
          <Text
            style={[
              styles.addToCartText,
              isAdded && styles.addedText,
              isOutOfStock && styles.disabledText,
            ]}
          >
            {isOutOfStock
              ? 'Нет в наличии'
              : isCheckingCart
                ? 'Проверка корзины...'
                : isAdded
                  ? 'Товар в корзине'
                  : isAuthenticated
                    ? 'Добавить в корзину'
                    : 'Авторизуйтесь, чтобы добавить в корзину'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  productDetail: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  sliderContainer: {
    marginBottom: 16,
    position: 'relative',
    height: 300,
    marginTop:10,
  },
  sliderItem: {
    width: width - 40,
    height: 300,
    alignItems: 'center',
    justifyContent: 'top',
    backgroundColor: 'white',

  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  thumbnailGallery: {
    marginTop: 10,
    height: THUMBNAIL_SIZE + 20,
  },
  thumbnailList: {
    paddingHorizontal: 10,
    marginLeft:10,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailContainerActive: {
    borderColor: '#4CAF50',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  productInfo: {
    padding: 20,
  },
  nameContainer: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  priceContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  priceTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  productPrice: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  stockIconContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  stockText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  descriptionBox: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  productDescription: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  attributesContainer: {
    marginBottom: 20,
  },
  attributesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  attributesBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  attributeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  attributeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attributeName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  attributeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cartIcon: {marginRight: 8,
  },
  addedButton: {
    backgroundColor: '#E0E0E0',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addedText: {
    color: '#757575',
  },
  disabledText: {
    color: '#FFFFFF',
  },
  arButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 20,
  },
  arButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;