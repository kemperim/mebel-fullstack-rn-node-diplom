import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, Button, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const ORDER_STATUSES = ['Оформлен', 'В обработке', 'Доставляется', 'Завершён', 'Отменён'];

const updateOrderStatus = ({ route }) => {
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://192.168.92.67:5000/orders/order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data.order);
        setSelectedStatus(response.data.order.status);
      } catch (err) {
        console.error('Ошибка загрузки деталей заказа', err);
        Alert.alert('Ошибка', 'Не удалось загрузить заказ');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const updateOrderStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`http://192.168.92.67:5000/admin/admin/orders/${order.id}/status`, 
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      Alert.alert('Успешно', 'Статус заказа обновлён');
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      Alert.alert('Ошибка', 'Не удалось обновить статус');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Заказ №{order.id}</Text>
      <Text>Имя клиента: {order.user?.name}</Text>
      <Text>Статус: {order.status}</Text>
      <Text>Дата заказа: {new Date(order.created_at).toLocaleString()}</Text>

      <Text style={styles.sectionTitle}>Изменить статус:</Text>
      <Picker
        selectedValue={selectedStatus}
        onValueChange={(itemValue) => setSelectedStatus(itemValue)}
        style={styles.picker}
      >
        {ORDER_STATUSES.map((status) => (
          <Picker.Item key={status} label={status} value={status} />
        ))}
      </Picker>

      <Button title="Обновить статус" onPress={updateOrderStatus} />

      <Text style={styles.sectionTitle}>Товары:</Text>
      {order.products?.map((product) => (
        <View key={product.id} style={styles.productBox}>
          <Text>{product.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f8f8f8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    backgroundColor: '#fff',
    marginVertical: 10,
  },
  productBox: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});


export default updateOrderStatus;