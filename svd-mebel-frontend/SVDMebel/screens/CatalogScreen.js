console.warn = () => {}; 

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const { width } = Dimensions.get('window');

const CatalogScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const [autoScrollInterval, setAutoScrollInterval] = useState(null); // Состояние для хранения ID интервала

  const sliderImages = [
    { id: '1', imageUrl: require('../assets/img_ban1.png') },
    { id: '2', imageUrl: require('../assets/img_ban2.png') },
    { id: '3', imageUrl: require('../assets/img_ban3.png') },
  ];

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const scrollTo = useCallback((index) => {
    flatListRef.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });
    setCurrentIndex(index);
  }, [width]);

  const scrollToSlider = useCallback((index) => {
    sliderRef.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });
    setCurrentIndex(index);
  }, [width]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://192.168.93.67:5000/category');
        setCategories(res.data);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Запускаем таймер при монтировании компонента
    const intervalId = setInterval(() => {
      const nextIndex = (currentIndex + 1) % sliderImages.length;
      scrollToSlider(nextIndex);
    }, 3000); // Интервал в 3 секунды (настрой по желанию)

    setAutoScrollInterval(intervalId);

    // Очищаем таймер при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [currentIndex, sliderImages.length, scrollToSlider]); // Зависимости useEffect

  const SliderItem = ({ item }) => (
    <Image source={item.imageUrl} style={styles.sliderImage} />
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#FF7043" style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Слайдер с картинками */}
      <View style={styles.sliderContainer}>
        <FlatList
          ref={sliderRef}
          data={sliderImages}
          renderItem={({ item }) => <SliderItem item={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
          style={styles.slider}
        />
        {/* Индикаторы страниц */}
        <View style={styles.pagination}>
          {sliderImages.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive,
              ]}
              onPress={() => scrollToSlider(index)}
            />
          ))}
        </View>
      </View>

      {/* Заголовок для категорий */}
      <Text style={styles.categoriesTitle}>Каталог товаров</Text>

      {/* Список категорий */}
      <View style={styles.categoriesList}>
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => navigation.navigate('Subcategory', { categoryId: item.id, categoryName: item.name })}
            >
              <Image source={{ uri: item.image }} style={styles.categoryImage} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sliderContainer: {
    marginBottom: 20,
    height: 200,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 10,
  },
  slider: {
    width: '100%',
    height: '100%',
  },
  sliderImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'gray',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#FF7043',
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    height: 250,
    maxWidth: (width / 2) - 20,
  },
  categoryImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  categoryInfo: {
    padding: 10,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CatalogScreen;