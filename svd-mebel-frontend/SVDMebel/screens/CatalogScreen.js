import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import axios from 'axios';

const { width } = Dimensions.get('window');

const CatalogScreen = () => {
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subcatRes] = await Promise.all([
          axios.get('http://192.168.8.100:5000/category'),
          axios.get('http://192.168.8.100:5000/subcategory'),
        ]);

        if (catRes.data && subcatRes.data) {
          setCategories(catRes.data);
          setAllSubcategories(subcatRes.data);
        } else {
          throw new Error('Данные пусты');
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategorySelect = (categoryId, categoryName) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setSelectedSubcategory(null);
    setProducts([]);
    const filtered = allSubcategories.filter(sub => sub.category_id === categoryId);
    setFilteredSubcategories(filtered);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setFilteredSubcategories([]);
    setProducts([]);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryPress = async (subcategory) => {
    console.log('Выбрана подкатегория с ID:', subcategory.id); // ← вот сюда
    setSelectedSubcategory(subcategory);
    setProductLoading(true);
    try {
      // Используем правильный формат URL для запроса товаров
      const res = await axios.get(`http://192.168.8.100:5000/products/products/subcategory_id=${subcategory.id}`);
      console.log('Ответ от сервера с товарами:', res.data); // Добавь лог для ответа от сервера
      setProducts(res.data);
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err);
      setError('Не удалось загрузить товары');
    } finally {
      setProductLoading(false);
    }
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
        <View>
          <TouchableOpacity onPress={handleBackToCategories} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Назад к категориям</Text>
          </TouchableOpacity>

          <Text style={styles.categoryTitle}>{selectedCategory.name}</Text>

          <FlatList
            data={filteredSubcategories}
            horizontal
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.subcategoryButton, selectedSubcategory?.id === item.id && styles.activeSubcategory]}
                onPress={() => handleSubcategoryPress(item)}
              >
                <Text style={styles.subcategoryButtonText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          {productLoading ? (
            <ActivityIndicator size="large" color="#FF7043" style={{ marginTop: 20 }} />
          ) : products.length === 0 ? (
            <Text style={styles.noSub}>Нет товаров</Text>
          ) : (
            <FlatList
              data={products}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <View style={styles.productItem}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>{item.price} ₸</Text>
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
  backButton: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#FF7043',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subcategoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
  },
  activeSubcategory: {
    backgroundColor: '#FF7043',
  },
  subcategoryButtonText: {
    fontSize: 16,
    color: '#333',
  },
  noSub: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  productItem: {
    width: (width / 2) - 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    color: '#333',
  },
  productPrice: {
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
