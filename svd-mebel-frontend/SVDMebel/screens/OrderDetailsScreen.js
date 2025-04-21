import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailsScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log(token);
        const response = await axios.get(`http://192.168.8.100:5000/orders/order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data.order);
      } catch (err) {
        console.error('Ошибка загрузки деталей заказа', err);
        setError('Ошибка загрузки деталей заказа');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3366ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Заказ не найден</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Заказ #{order.id}</Text>
      <Text style={styles.text}>Статус: {order.status}</Text>
      <Text style={styles.text}>Адрес: {order.address}</Text>
      <Text style={styles.text}>Телефон: {order.phone_number}</Text>
      <Text style={styles.text}>Имя клиента: {order.user.name}</Text>

      <Text style={[styles.title, { marginTop: 20 }]}>Товары</Text>
      <FlatList
        data={order.products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text>Цена: {item.OrderItem.price} ₸</Text>
            <Text>Количество: {item.OrderItem.quantity}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 4 },
  productCard: {
    backgroundColor: '#f2f6ff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 4,
  },
});

export default OrderDetailsScreen;
