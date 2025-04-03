import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import axios from 'axios';

const { width } = Dimensions.get('window'); // Получаем ширину экрана устройства

const CatalogScreen = () => {
  const [categories, setCategories] = useState([]); // Храним категории
  const [subcategories, setSubcategories] = useState([]); // Храним подкатегории
  const [loading, setLoading] = useState(true); // Индикатор загрузки
  const [loadingSubcategories, setLoadingSubcategories] = useState(false); // Индикатор загрузки подкатегорий
  const [error, setError] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState(null); // Храним выбранную категорию

  useEffect(() => {
    // Загружаем категории при первом рендере
    axios.get('http://192.168.8.100:5000/category') // Ваш API эндпоинт
      .then(response => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки категорий:', error);
        setError('Не удалось загрузить категории');
        setLoading(false);
      });
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setLoadingSubcategories(true); // Включаем индикатор загрузки подкатегорий

    // Загружаем все подкатегории
  // Получение всех категорий
axios.get('http://192.168.8.100:5000/category')
.then(response => {
  const categories = response.data;
  // Теперь можно запросить подкатегории для каждой категории
  loadSubcategories(categories);
})
.catch(error => {
  console.error('Ошибка загрузки категорий:', error.response || error);
  setLoadingSubcategories(false);
  setError('Не удалось загрузить категории');
});

  
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSubcategories([]); // Очистка подкатегорий при возвращении
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      {!selectedCategory ? (
        // Если категория не выбрана, показываем список категорий
        <FlatList
          data={categories}
          numColumns={2} // Разделяем на 2 колонки
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.categoryItem}
              onPress={() => handleCategorySelect(item.id)} // Выбор категории
            >
              <Image source={{ uri: item.image }} style={styles.categoryImage} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        // Если категория выбрана, показываем подкатегории
        <View style={styles.subcategoryContainer}>
          <TouchableOpacity onPress={handleBackToCategories} style={styles.backButton}>
            <Text style={styles.backButtonText}>Назад к категориям</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Подкатегории:</Text>
          {loadingSubcategories ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={subcategories}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.subcategoryItem}>
                  <Text style={styles.subcategoryName}>{item.name}</Text>
                  <Text style={styles.subcategoryDescription}>{item.description}</Text>
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f5f5f5', 
  },
  categoryItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    marginRight: 10, // Отступ между колонками
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    height: 250, // Устанавливаем одинаковую высоту для всех элементов
    maxWidth: (width / 2) - 20, // Задаем максимальную ширину для элемента, чтобы они не выходили за пределы экрана
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
  subcategoryContainer: {
    marginTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subcategoryItem: {
    padding: 12,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
    borderRadius: 8,
  },
  subcategoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  subcategoryDescription: {
    fontSize: 14,
    color: '#777',
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', textAlign: 'center', marginTop: 10 },
  backButton: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  }
});

export default CatalogScreen;
