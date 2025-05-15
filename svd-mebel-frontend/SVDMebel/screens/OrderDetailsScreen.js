import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const OrderDetailsScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`http://192.168.59.67:5000/orders/order/${orderId}`, {
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

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#FFC107',
      'completed': '#4CAF50',
      'canceled': '#F44336',
    };
    return colors[status] || '#999';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'time',
      'completed': 'checkmark-circle',
      'canceled': 'close-circle',
    };
    return icons[status] || 'help-circle';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Ionicons name="search" size={48} color="#999" />
        <Text style={styles.notFoundText}>Заказ не найден</Text>
      </View>
    );
  }

  const totalAmount = order.products.reduce((sum, item) => 
    sum + (item.OrderItem.price * item.OrderItem.quantity), 0
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.orderNumber}>Заказ #{order.id}</Text>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(order.status) }]}>
            <Ionicons name={getStatusIcon(order.status)} size={20} color="#FFFFFF" />
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="person" size={24} color="#4CAF50" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Клиент</Text>
            <Text style={styles.infoValue}>{order.user.name}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="call" size={24} color="#4CAF50" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Телефон</Text>
            <Text style={styles.infoValue}>{order.phone_number}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="location" size={24} color="#4CAF50" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Адрес</Text>
            <Text style={styles.infoValue}>{order.address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>Товары</Text>
        <FlatList
          data={order.products}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.OrderItem.price.toLocaleString('ru-RU')} ₸</Text>
              </View>
              <View style={styles.productDetails}>
                <View style={styles.quantityContainer}>
                  <Ionicons name="cube" size={16} color="#666" />
                  <Text style={styles.quantityText}>x{item.OrderItem.quantity}</Text>
                </View>
                <Text style={styles.subtotal}>
                  {(item.OrderItem.price * item.OrderItem.quantity).toLocaleString('ru-RU')} ₸
                </Text>
              </View>
            </View>
          )}
        />
      </View>

      <View style={styles.totalSection}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.totalGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.totalLabel}>Итого</Text>
          <Text style={styles.totalAmount}>{totalAmount.toLocaleString('ru-RU')} ₸</Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 120,
    marginBottom: 20,
  },
  headerGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  productsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  totalGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 12,
    textAlign: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default OrderDetailsScreen;
