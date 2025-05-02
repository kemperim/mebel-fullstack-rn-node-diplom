import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const ORDER_STATUSES = ['Оформлен', 'В обработке', 'Доставляется', 'Завершён', 'Отменён'];

const updateOrderStatus = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://192.168.66.67:5000/orders/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(response.data.order);
      setSelectedStatus(response.data.order.status);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err) {
      console.error('Ошибка загрузки деталей заказа', err);
      Alert.alert('Ошибка', 'Не удалось загрузить заказ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrderDetails();
    }, [fetchOrderDetails])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const updateOrderStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`http://192.168.66.67:5000/admin/admin/orders/${order.id}/status`, 
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Оформлен':
        return ['#FFA726', '#FFB74D'];
      case 'В обработке':
        return ['#42A5F5', '#64B5F6'];
      case 'Доставляется':
        return ['#7E57C2', '#9575CD'];
      case 'Завершён':
        return ['#4CAF50', '#66BB6A'];
      case 'Отменён':
        return ['#EF5350', '#E57373'];
      default:
        return ['#666', '#888'];
    }
  };

  const calculateTotal = (products) => {
    return products?.reduce((total, product) => {
      return total + ((product?.price || 0) * (product?.quantity || 0));
    }, 0) || 0;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={48} color="#EF5350" style={styles.errorIcon} />
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4CAF50']}
          tintColor="#4CAF50"
        />
      }
    >
      <Animated.View
        style={[
          styles.orderCard,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.orderHeader}>
          <Ionicons name="receipt" size={24} color="#4CAF50" />
          <Text style={styles.title}>Заказ №{order.id}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#666" />
            <Text style={styles.infoText}>{order.user?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.infoText}>
              {new Date(order.created_at).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Текущий статус:</Text>
          <LinearGradient
            colors={getStatusColor(order.status)}
            style={styles.currentStatus}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.currentStatusText}>{order.status}</Text>
          </LinearGradient>
        </View>

        <View style={styles.pickerSection}>
          <Text style={styles.sectionTitle}>Изменить статус:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue) => setSelectedStatus(itemValue)}
              style={styles.picker}
            >
              {ORDER_STATUSES.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={updateOrderStatus}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.updateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="refresh" size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Обновить статус</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Товары:</Text>
          {order.products?.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Ionicons name="cube" size={20} color="#4CAF50" />
                <Text style={styles.productName}>{product.name || 'Без названия'}</Text>
                <Text style={styles.productTotal}>
                  {(order.total_price).toLocaleString('ru-RU')} ₸
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Ionicons name="receipt" size={24} color="#4CAF50" />
              <Text style={styles.totalText}>Итого:</Text>
              <Text style={styles.totalAmount}>
              {(order.total_price).toLocaleString('ru-RU')} ₸
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
    minHeight: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    gap: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  statusSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  currentStatus: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentStatusText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerSection: {
    marginBottom: 20,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  updateButton: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  productsSection: {
    gap: 12,
  },
  productCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  productName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  productTotal: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    color: '#EF5350',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  totalCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
});

export default updateOrderStatus;