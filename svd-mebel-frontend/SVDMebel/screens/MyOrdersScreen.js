// src/screens/MyOrdersScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const MyOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('http://192.168.8.100:5000/orders/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data.orders);
      } catch (err) {
        setError('Ошибка загрузки заказов');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      style={styles.order}
    >
      <Text style={styles.title}>Заказ #{item.id}</Text>
      <Text>Статус: {item.status}</Text>
      <Text>Адрес: {item.address}</Text>
      <Text>Телефон: {item.phone_number}</Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" color="#007bff" />;
  if (error) return <Text>{error}</Text>;

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 20 }}
    />
  );
};

const styles = StyleSheet.create({
  order: {
    padding: 15,
    backgroundColor: '#e6f0ff',
    marginBottom: 15,
    borderRadius: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default MyOrdersScreen;
