import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Button, TextInput } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

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

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                const response = await axios.get("http://192.168.92.67:5000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
                setAddress(response.data.address || "");
                setPhone(response.data.phone || "");

                const userId = response.data.id;
                const cartResponse = await axios.get(`http://192.168.92.67:5000/cart/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const cartItemsData = cartResponse.data.map(item => item.Product);
                setCartItems(cartItemsData);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
            console.error("Ошибка при загрузке данных пользователя:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [fetchUserData])
    );

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        setUser(null);
        navigation.navigate("Main");
    };

    const saveAddress = async () => {
        setSavingAddress(true);
        try {
            const token = await AsyncStorage.getItem("token");
            await axios.put(
                "http://192.168.92.67:5000/user/profile/address",
                { address },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            Alert.alert("Успешно", "Адрес сохранён");
            setIsEditingAddress(false);
        } catch (error) {
            Alert.alert("Ошибка", "Не удалось сохранить адрес");
        } finally {
            setSavingAddress(false);
        }
    };

    const savePhone = async () => {
        setSavingPhone(true);
        try {
            const token = await AsyncStorage.getItem("token");
            await axios.put(
                "http://192.168.92.67:5000/user/profile/phone",
                { phone },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            Alert.alert("Успешно", "Номер телефона сохранён");
            setIsEditingPhone(false);
        } catch (error) {
            Alert.alert("Ошибка", "Не удалось сохранить номер телефона");
        } finally {
            setSavingPhone(false);
        }
    };

    const renderCartItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cartItem}
            onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
        >
            <Image source={{ uri: `http://192.168.92.67:5000${item.image}`  }} style={styles.cartItemImage} />
            <Text style={styles.cartItemName}>{item.name}</Text>
            <Text style={styles.cartItemPrice}>{item.price}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.containerCentered}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            {user ? (
                <>
                    <View style={styles.header}>
                        <View style={styles.profileInfo}>
                            <View style={styles.avatarContainer}>
                                {user.avatar ? (
                                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.defaultAvatar}>
                                        <Ionicons name="person-outline" size={60} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.profileName}>{user.name}</Text>
                            {user.email && <Text style={styles.profileEmail}>{user.email}</Text>}
                        </View>
                   
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Действия</Text>
                        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate("Orders")}>
                            <Ionicons name="receipt-outline" size={20} color="#388E3C" style={styles.actionIcon} />
                            <Text style={styles.actionText}>Мои заказы</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate("Корзина")}> 
                            <Ionicons name="cart-outline" size={20} color="#388E3C" style={styles.actionIcon} />
                            <Text style={styles.actionText}>Корзина</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
                        </TouchableOpacity>

                        {cartItems.length > 0 ? (
                            <FlatList
                                data={cartItems}
                                renderItem={renderCartItem}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.cartSliderContainer}
                            />
                        ) : (
                            <Text style={styles.noItemsText}>Корзина пуста</Text>
                        )}

                        {user?.role === "admin" && (
                            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate("AdminPanel")}> 
                                <MaterialCommunityIcons name="view-dashboard-outline" size={20} color="#2E7D32" style={styles.actionIcon} />
                                <Text style={styles.actionText}>Админ панель</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Информация</Text>

                        <View style={styles.infoItem}>
                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={20} color="#388E3C" style={styles.infoIcon} />
                                <Text style={styles.infoLabel}>Адрес доставки:</Text>
                                <TouchableOpacity onPress={() => setIsEditingAddress(true)}>
                                    <Ionicons name="pencil-outline" size={18} color="#888" />
                                </TouchableOpacity>
                            </View>
                            {!isEditingAddress ? (
                                <Text style={styles.infoValue}>{address || "Нажмите, чтобы добавить адрес"}</Text>
                            ) : (
                                <>
                                    <TextInput
                                        mode="outlined"
                                        placeholder="Введите адрес"
                                        value={address}
                                        onChangeText={setAddress}
                                        style={styles.input}
                                    />
                                    <Button
                                        mode="contained"
                                        onPress={saveAddress}
                                        loading={savingAddress}
                                        disabled={savingAddress}
                                        style={styles.saveButton}
                                    >
                                        Сохранить
                                    </Button>
                                </>
                            )}
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={20} color="#388E3C" style={styles.infoIcon} />
                                <Text style={styles.infoLabel}>Номер телефона:</Text>
                                <TouchableOpacity onPress={() => setIsEditingPhone(true)}>
                                    <Ionicons name="pencil-outline" size={18} color="#888" />
                                </TouchableOpacity>
                            </View>
                            {!isEditingPhone ? (
                                <Text style={styles.infoValue}>{phone || "Нажмите, чтобы добавить номер телефона"}</Text>
                            ) : (
                                <>
                                    <TextInput
                                        mode="outlined"
                                        placeholder="Введите номер телефона"
                                        value={phone}
                                        onChangeText={setPhone}
                                        style={styles.input}
                                        keyboardType="phone-pad"
                                    />
                                    <Button
                                        mode="contained"
                                        onPress={savePhone}
                                        loading={savingPhone}
                                        disabled={savingPhone}
                                        style={styles.saveButton}
                                    >
                                        Сохранить
                                    </Button>
                                </>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
                        <Text style={styles.logoutText}>Выйти</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <View style={styles.guestContainer}>
                    <View style={styles.avatarCircle}>
                        <Image source={require('../assets/logo.png')} style={styles.avatar} resizeMode="contain" />
                    </View>
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
                    <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}> 
                        <Text style={styles.loginText}>Уже есть аккаунт? Войти</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};



const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "#F5F8F5",
      paddingHorizontal: 20,
      paddingTop: 20,
  },
  header: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
  },
  profileInfo: {
      alignItems: "center",
  },
  avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: "hidden",
      marginBottom: 10,
      backgroundColor: '#E0E0E0',
      justifyContent: 'center',
      alignItems: 'center',
  },
  avatar: {
      width: 80,
      height: 80,
  },
  defaultAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
  },
  profileName: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#2E7D32",
      marginBottom: 5,
  },
  profileEmail: {
      fontSize: 16,
      color: "#666",
  },
  adminIconContainer: {
      padding: 10,
  },
  section: {
      marginBottom: 20,
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#388E3C",
      marginBottom: 15,
  },
  actionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: "#eee",
  },
  actionIcon: {
      marginRight: 15,
  },
  actionText: {
      fontSize: 16,
      color: "#333",
      flex: 1,
  },
  

      cartContainer: {
          paddingVertical: 15,
          backgroundColor: '#F9F9F9',
          borderRadius: 12,
          marginTop: 10,
          elevation: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0.5 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
          overflow: 'hidden', // Чтобы borderRadius работал корректно с FlatList
      },
      cartButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 15,
          paddingVertical: 12,
      },
      cartIcon: {
          marginRight: 12,
      },
      cartText: {
          fontSize: 17,
          color: "#333",
          flex: 1,
      },
      cartSliderContainer: {
          paddingLeft: 15,
          marginTop: 10,
      },
      cartItem: {
          backgroundColor: "#FFFFFF",
          padding: 12,
          borderRadius: 10,
          marginRight: 12,
          width: 110,
          height: 130,
          justifyContent: "space-around",
          alignItems: "center",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          marginBottom:5,
          marginTop:5,
      },
      cartItemImage: {
          width: 60,
          height: 60,
          resizeMode: "contain",
      },
      cartItemName: {
          fontSize: 13,
          color: "#388E3C",
          textAlign: "center",
      },
      cartItemPrice: {
          fontSize: 15,
          fontWeight: "bold",
          color: "#2E7D32",
          textAlign: "center",
      },
      noItemsText: {
          fontSize: 16,
          color: "#777",
          marginTop: 15,
          paddingHorizontal: 15,
          textAlign: 'center',
      },
  infoItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: "#eee",
  },
  infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
  },
  infoIcon: {
      marginRight: 15,
  },
  infoLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: "#333",
      flex: 1,
  },
  infoValue: {
      fontSize: 16,
      color: "#666",
      marginLeft: 35,
  },
  input: {
      marginTop: 10,
      backgroundColor: "#FFF",
  },
  saveButton: {
      marginTop: 10,
  },
  logoutButton: {
      backgroundColor: '#D32F2F',
      paddingVertical: 14,
      borderRadius: 10,
      marginTop: 30,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      flexDirection: 'row',
      marginBottom:50,
  },
  logoutIcon: {
      marginRight: 10,
  },
  logoutText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#FFFFFF",
  },
  guestContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  avatarCircle: {
      backgroundColor: '#E8F5E9',
      borderRadius: 75,
      width: 150,
      height: 150,
      marginBottom: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
  },
  avatar: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
  },
  greeting: {
      fontSize: 20,
      textAlign: "center",
      color: "#388E3C",
      marginBottom: 30,
  },
  registerButton: {
      marginTop: 20,
      backgroundColor: '#43A047',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
  },
  buttonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: '#fff',
  },
  loginButton: {
      marginTop: 20,
  },
  loginText: {
      color: '#388E3C',
      fontSize: 16,
  },
});

export default ProfileScreen;