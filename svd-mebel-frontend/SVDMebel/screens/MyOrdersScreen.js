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
        const res = await axios.get('http://192.168.92.67:5000/orders/my', {
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

  // Разделение заказов на незавершенные и завершенные
  const pendingOrders = orders.filter(order =>
    order.status === 'Оформлен' || order.status === 'В обработке' || order.status === 'Доставляется'
  );

  const completedOrders = orders.filter(order =>
    order.status === 'Завершен' || order.status === 'Отменен'
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      style={styles.orderCard}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Заказ #{item.id}</Text>
        <Text style={[styles.status, styles[`status_${item.status.toLowerCase().replace(' ', '_')}`]]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.orderDate}>Размещен: {new Date(item.created_at).toLocaleDateString()}</Text>
      <Text style={styles.orderAddress}>Адрес: {item.address.substring(0, 30)}...</Text>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      >
        <Text style={styles.detailsButtonText}>Подробнее</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <>
          {/* Раздел для незавершенных заказов */}
          {pendingOrders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Незавершенные заказы</Text>
              <FlatList
                data={pendingOrders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          )}

          {/* Раздел для завершенных заказов */}
          {completedOrders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Завершенные заказы</Text>
              <FlatList
                data={completedOrders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4fdf7', // Light greenish background
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c', // Green title color
    marginBottom: 10,
  },
  orderCard: {
    padding: 15,
    backgroundColor: '#e0f7e9', // Light greenish card background
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a5d6a7', // Slight green border
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#388e3c', // Dark green text for the order ID
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  status_оформлен: {
    backgroundColor: '#ffeb3b', // Yellow for "Оформлен"
    color: '#fff',
  },
  status_в_обработке: {
    backgroundColor: '#ff9800', // Orange for "В обработке"
    color: '#fff',
  },
  status_доставляется: {
    backgroundColor: '#2196f3', // Blue for "Доставляется"
    color: '#fff',
  },
  status_завершен: {
    backgroundColor: '#4caf50', // Green for "Завершен"
    color: '#fff',
  },
  status_отменен: {
    backgroundColor: '#f44336', // Red for "Отменен"
    color: '#fff',
  },
  orderDate: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  detailsButton: {
    backgroundColor: '#4caf50', // Green button background
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyOrdersScreen;
