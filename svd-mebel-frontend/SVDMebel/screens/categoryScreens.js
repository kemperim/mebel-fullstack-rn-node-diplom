import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

const CatalogScreen = () => {
  const [products, setProducts] = useState([]); // Храним товары
  const [loading, setLoading] = useState(true); // Индикатор загрузки

  useEffect(() => {
    axios.get('http://192.168.59.67:5000/products/') // Обрати внимание на порт
      .then(response => {
        setProducts(response.data); // Сохраняем данные
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки товаров:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Каталог товаров</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()} // Преобразуем id в строку
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price} ₸</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  productItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  productName: { fontSize: 18 },
  productPrice: { fontSize: 16, color: 'green' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default CatalogScreen;
