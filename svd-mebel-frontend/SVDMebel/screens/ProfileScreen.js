import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
  Alert,
  FlatList
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Button, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const scaleAnim = new Animated.Value(0.8);

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Функция для получения данных пользователя и корзины
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      const response = await axios.get("http://192.168.8.100:5000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      setAddress(response.data.address || "");
      setPhone(response.data.phone || "");

      const userId = response.data.id;
      const cartResponse = await axios.get(`http://192.168.8.100:5000/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartItemsData = cartResponse.data.map(item => item.Product);
      setCartItems(cartItemsData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Вызываем fetchUserData при монтировании и при возврате на экран
  useEffect(() => {
    fetchUserData();
  }, []);

  // Используем useFocusEffect для обновления данных при возвращении на экран
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData(); // Перезагружаем данные при фокусе
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
    navigation.navigate("Login");
  };

  const saveAddress = async () => {
    try {
      setSavingAddress(true);
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        "http://192.168.8.100:5000/user/profile/address",
        { address },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Успешно", "Адрес сохранён");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сохранить адрес");
    } finally {
      setSavingAddress(false);
    }
  };

  const savePhone = async () => {
    try {
      setSavingPhone(true);
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        "http://192.168.8.100:5000/user/profile/phone",
        { phone },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Успешно", "Номер телефона сохранён");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сохранить номер телефона");
    } finally {
      setSavingPhone(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cartItem}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <Text style={styles.cartItemText}>{item.name}</Text>
      <Text style={styles.cartItemText}>${item.price}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.userName}>
          {user ? "Приветствуем " + user.name + "!" : "Гость"}
        </Text>

        <View style={styles.iconContainer}>
          {user?.role === "admin" && (
            <TouchableOpacity onPress={() => navigation.navigate("AdminPanel")}>
              <Ionicons name="key-outline" size={24} color="#43A047" style={styles.adminIcon} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={24} color="#388E3C" />
          </TouchableOpacity>
        </View>
      </View>

      {user ? (
        <>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Orders")}>
            <Text style={styles.itemText}>📦 Мои заказы</Text>
          </TouchableOpacity>

          <View style={styles.item}>
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Корзина")}>
              <Text style={styles.itemText}>🛒 Корзина </Text>
            </TouchableOpacity>

            {cartItems.length > 0 ? (
              <View style={styles.cartSliderContainer}>
                <FlatList
                  data={cartItems}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            ) : (
              <Text style={styles.noItemsText}>Корзина пуста</Text>
            )}
          </View>

          <View style={styles.itemColumn}>
            <TouchableOpacity onPress={() => setIsEditingAddress(true)}>
              <Text style={styles.itemText}>📍 Адрес доставки:</Text>
              {!isEditingAddress && (
                <Text style={{ marginTop: 8, color: "#666" }}>
                  {address || "Нажмите, чтобы добавить адрес"}
                </Text>
              )}
            </TouchableOpacity>

            {isEditingAddress && (
              <>
                <TextInput
                  mode="outlined"
                  placeholder="Введите адрес"
                  value={address}
                  onChangeText={setAddress}
                  style={styles.addressInput}
                />
                <Button
                  mode="contained"
                  onPress={async () => {
                    await saveAddress();
                    setIsEditingAddress(false);
                  }}
                  loading={savingAddress}
                  disabled={savingAddress}
                  style={styles.saveButton}
                >
                  Сохранить адрес
                </Button>
              </>
            )}
          </View>

          <View style={styles.itemColumn}>
            <TouchableOpacity onPress={() => setIsEditingPhone(true)}>
              <Text style={styles.itemText}>📞 Номер телефона:</Text>
              {!isEditingPhone && (
                <Text style={{ marginTop: 8, color: "#666" }}>
                  {phone || "Нажмите, чтобы добавить номер телефона"}
                </Text>
              )}
            </TouchableOpacity>

            {isEditingPhone && (
              <>
                <TextInput
                  mode="outlined"
                  placeholder="Введите номер телефона"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.addressInput}
                  keyboardType="phone-pad"
                />
                <Button
                  mode="contained"
                  onPress={async () => {
                    await savePhone();
                    setIsEditingPhone(false);
                  }}
                  loading={savingPhone}
                  disabled={savingPhone}
                  style={styles.saveButton}
                >
                  Сохранить номер
                </Button>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 ВЫЙТИ</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.greeting}>
            Давайте знакомиться! {"\n"} Регистрация даст возможность оформлять заказы!
          </Text>
          <Button
            mode="contained"
            style={styles.registerButton}
            labelStyle={styles.buttonText}
            onPress={() => navigation.navigate("Register")}
          >
            ЗАРЕГИСТРИРОВАТЬСЯ
          </Button>
        </>
      )}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F5",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2E7D32",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 16,
  },
  adminIcon: {
    marginRight: 10,
  },
  avatarCircle: {
    alignSelf: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 60,
    width: 120,
    height: 120,
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  item: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "column", // Чтобы кнопка и слайдер шли друг под другом

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#388E3C",
  },
  itemColumn: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressInput: {
    marginTop: 10,
    backgroundColor: "#FFF",
  },
  saveButton: {
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#FF7043",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cartSliderContainer: {
    width: '100%',
    height: 200, // Ограничиваем высоту слайдера
    overflow: 'hidden', // Чтобы слайдер не выходил за рамки
    marginTop: 12, 
  },
  cartItem: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 15, // Более скругленные углы
    marginRight: 20, // Немного больше отступ
    width: 200, // Немного больше ширина для лучшего визуального восприятия
    height: 200, // Соответственно увеличена высота
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Более выраженная тень
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // Изменение позиции тени для эффекта подъема
    shadowOpacity: 0.2, // Сделаем тень более выраженной
    shadowRadius: 10, // Увеличим радиус тени для плавности
    borderWidth: 1, // Добавим границу для выделения
    borderColor: "#DDDDDD", // Цвет границы
    backgroundColor: "#F9F9F9", // Легкий сероватый фон для контраста
    overflow: "hidden", // Прячем элементы, выходящие за пределы
    transform: [{ scale: 1 }], // Плавное увеличение при наведении
    transition: "transform 0.3s ease", // Плавное увеличение
  },
  cartItemImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  cartItemText: {
    marginTop: 10,
    fontSize: 14,
    color: "#388E3C",
    textAlign: "center",
  },
  noItemsText: {
    textAlign: "center",
    color: "#666",
  },
  greeting: {
    fontSize: 20,
    textAlign: "center",
    color: "#388E3C",
  },
  registerButton: {
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ProfileScreen;
