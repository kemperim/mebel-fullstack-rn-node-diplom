import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const AdminAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // Initialize navigation object

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://192.168.8.100:5000/products/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке товаров:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductPress = (productId) => {
    // Здесь вы можете определить, что произойдет при нажатии на товар.
    // Например, переход на страницу с детальной информацией о товаре,
    // передавая ID товара в качестве параметра.
    navigation.navigate('ProductDetails', { productId: productId });
    console.log(`Нажат товар с ID: ${productId}`);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity   style={styles.productItem}
    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    activeOpacity={0.9}
    style={styles.card}>
      {item.images?.length > 0 || item.image ? (
        <Image
          source={{ uri: item.image}}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>Нет изображения</Text>
        </View>
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price} ₸</Text>
      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        style={styles.container}
        data={products || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: '#F9F9F9',
    padding: 10
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10
  },
  noImage: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  noImageText: {
    color: '#888'
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10
  },
  price: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 5
  },
  description: {
    marginTop: 5,
    color: '#666'
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
  },
});

export default AdminAllProducts;