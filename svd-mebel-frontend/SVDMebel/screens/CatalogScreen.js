import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';  // Импорт иконок

const { width } = Dimensions.get('window');

const CatalogScreen = () => {
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subcatRes] = await Promise.all([
          axios.get('http://192.168.8.100:5000/category'),
          axios.get('http://192.168.8.100:5000/subcategory'),
        ]);

        setCategories(catRes.data);
        setAllSubcategories(subcatRes.data);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategorySelect = (categoryId, categoryName) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    const filtered = allSubcategories.filter(sub => sub.category_id === categoryId);
    setFilteredSubcategories(filtered);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setFilteredSubcategories([]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FF7043" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      {!selectedCategory ? (
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleCategorySelect(item.id, item.name)}
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
        <View style={styles.subcategoryContainer}>
          <TouchableOpacity onPress={handleBackToCategories} style={styles.backButton}>
            <Text style={styles.backButtonText}>Вернуться к категориям</Text>
          </TouchableOpacity>

          {/* Название категории */}
          <Text style={styles.categoryTitle}>{selectedCategory.name}</Text>

          {filteredSubcategories.length === 0 ? (
            <Text style={styles.noSub}>Нет подкатегорий</Text>
          ) : (
            <FlatList
              data={filteredSubcategories}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.subcategoryItem}>
                  <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
                  <View style={styles.subcategoryText}>
                    <Text style={styles.subcategoryName}>{item.name}</Text>
                  </View>
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
    backgroundColor: '#FFFFFF',
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
  subcategoryContainer: {
    marginTop: 20,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // белый фон
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // тень на Android
    height: 80,
  },

  subcategoryImage: {
    width: 50,
    height: 50,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginStart: 12,
  },

  subcategoryText: {
    padding: 12,
    flex: 1,
    justifyContent: 'center',
  },

  subcategoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
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
  backButton: {
    flexDirection: 'row', // для выравнивания стрелки и текста
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#FF7043', // оранжевый цвет
    borderRadius: 8,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8, // расстояние между стрелкой и текстом
  },
  noSub: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },
});

export default CatalogScreen;
