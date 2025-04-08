import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import axios from 'axios';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
      const userId = 1; // Идентификатор пользователя
      const response = await axios.get(`http://192.168.8.100:5000/cart/${userId}`);
      
      if (response.data && response.data.length > 0) {
        setCartItems(response.data);
        calculateTotal(response.data);
      } else {
        setCartItems([]);
        setTotal(0);
        console.log('Корзина пуста');
      }
    } catch (error) {
      console.error('Ошибка при получении корзины', error.response || error.message);
      alert('Не удалось загрузить корзину. Пожалуйста, попробуйте позже.');
    }
  };

  const calculateTotal = (items) => {
    const totalPrice = items.reduce((sum, item) => sum + item.quantity * parseFloat(item.Product.price), 0);
    setTotal(totalPrice);
  };

  // Используем useEffect для загрузки корзины при каждом рендере
  useEffect(() => {
    fetchCart();
  }, []); // Пустой массив зависимостей, чтобы запрос был выполнен только один раз при монтировании компонента

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`http://192.168.8.100:5000/cart/update/${itemId}`, { quantity: newQuantity });
      fetchCart(); // Обновляем корзину после изменения количества
    } catch (error) {
      console.error('Ошибка при обновлении количества товара', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`http://192.168.8.100:5000/cart/remove/${itemId}`);
      fetchCart(); // Обновляем корзину после удаления товара
    } catch (error) {
      console.error('Ошибка при удалении товара', error);
    }
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyCartText}>Корзина пуста</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image source={{ uri: item.Product.image }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.Product.name}</Text>
                <Text style={styles.productPrice}>{item.Product.price} ₽</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity>
                  <Text style={styles.productQuantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.quantityText}>-</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.removeContainer}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Text style={styles.removeButtonText}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Итого: {total} ₽</Text>
        </View>

        <TouchableOpacity 
          style={styles.checkoutButton} 
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutButtonText}>Перейти к оформлению</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F4F4',
    justifyContent: 'space-between',
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 18,
    color: '#FF8C00',
    marginVertical: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  quantityButton: {
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 12,
  },
  quantityText: {
    color: '#fff',
    fontSize: 22,
  },
  productQuantity: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  removeContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#FF5C5C',
    padding: 10,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  totalContainer: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFAF0',
    borderRadius: 12,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  checkoutButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CartScreen;
