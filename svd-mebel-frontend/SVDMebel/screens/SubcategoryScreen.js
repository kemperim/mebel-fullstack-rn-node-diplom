import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, StyleSheet } from 'react-native';
import axios from 'axios';

const SubcategoryScreen = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await axios.get(`http://192.168.59.67:5000/subcategory/`);
        const filteredSubcategories = res.data.filter(sub => sub.category_id === categoryId);
        setSubcategories(filteredSubcategories);
      } catch (err) {
        console.error('Ошибка загрузки подкатегорий:', err);
        setError('Не удалось загрузить подкатегории');
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#FF7043" />;
  }

  return (
    <View style={styles.container}>

      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={subcategories}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
            <TouchableOpacity
            onPress={() => navigation.navigate('Product', { 
              subcategoryId: item.id,
              subcategoryName: item.name // передаем название подкатегории
            })}
          >
            <View style={styles.subcategoryItem}>
              <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
              <Text style={styles.subcategoryName}>{item.name}</Text>
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
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  subcategoryImage: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  subcategoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SubcategoryScreen;
