import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const AdminOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Добавим состояние для ошибок

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null); // Сбрасываем ошибку перед новым запросом
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.92.67:5000/admin/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      setError('Не удалось загрузить заказы.'); // Устанавливаем сообщение об ошибке
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      return () => {
        // Функция очистки, выполняется при потере фокуса
        // console.log('Экран AdminOrdersScreen потерял фокус');
      };
    }, [fetchOrders])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('updateOrderStatus', { orderId: item.id })}
    >
      <Text style={styles.title}>Заказ #{item.id}</Text>
      <Text>Клиент: {item.user.name}</Text>
      <Text>Статус: {item.status}</Text>
      <Text>
        Дата заказа: {new Date(item.created_at).toLocaleString('ru-RU')}
      </Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.flatListContent}
    />
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AdminOrdersScreen;