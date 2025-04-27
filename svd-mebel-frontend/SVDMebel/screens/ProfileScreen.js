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
                const response = await axios.get("http://192.168.93.67:5000/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
                setAddress(response.data.address || "");
                setPhone(response.data.phone || "");

                const userId = response.data.id;
                const cartResponse = await axios.get(`http://192.168.93.67:5000/cart/${userId}`, {
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
                "http://192.168.93.67:5000/user/profile/address",
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
                "http://192.168.93.67:5000/user/profile/phone",
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
            <Image source={{ uri: `http://192.168.93.67:5000${item.image}`  }} style={styles.cartItemImage} />
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
                        <TouchableOpacity 
                            style={styles.actionItem} 
                            onPress={() => navigation.navigate("Orders")}
                        >
                            <View style={styles.actionIconContainer}>
                                <Ionicons name="receipt-outline" size={24} color="#388E3C" />
                            </View>
                            <Text style={styles.actionText}>Мои заказы</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
                        </TouchableOpacity>
                      
                        <TouchableOpacity 
                            style={styles.actionItem} 
                            onPress={() => navigation.navigate("Корзина")}
                        >
                            <View style={styles.actionIconContainer}>
                                <Ionicons name="cart-outline" size={24} color="#388E3C" />
                            </View>
                            <Text style={styles.actionText}>Корзина</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
                        </TouchableOpacity>

                        {user?.role === "admin" && (
                            <TouchableOpacity 
                                style={styles.actionItem} 
                                onPress={() => navigation.navigate("AdminPanel")}
                            >
                                <View style={styles.actionIconContainer}>
                                    <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="#2E7D32" />
                                </View>
                                <Text style={styles.actionText}>Админ панель</Text>
                                <Ionicons name="chevron-forward-outline" size={20} color="#888" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {cartItems.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>В корзине</Text>
                            <FlatList
                                data={cartItems}
                                renderItem={renderCartItem}
                                keyExtractor={(item) => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.cartSliderContainer}
                            />
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Информация</Text>
                        <View style={styles.infoItem}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIconContainer}>
                                    <Ionicons name="location-outline" size={24} color="#388E3C" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Адрес доставки</Text>
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
                                {!isEditingAddress && (
                                    <TouchableOpacity 
                                        style={styles.editButton}
                                        onPress={() => setIsEditingAddress(true)}
                                    >
                                        <Ionicons name="pencil-outline" size={20} color="#888" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIconContainer}>
                                    <Ionicons name="call-outline" size={24} color="#388E3C" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Номер телефона</Text>
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
                                {!isEditingPhone && (
                                    <TouchableOpacity 
                                        style={styles.editButton}
                                        onPress={() => setIsEditingPhone(true)}
                                    >
                                        <Ionicons name="pencil-outline" size={20} color="#888" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.logoutButton} 
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.logoutIcon} />
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
                    <TouchableOpacity 
                        style={styles.loginButton} 
                        onPress={() => navigation.navigate("Login")}
                    >
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
    },
    header: {
        backgroundColor: '#4CAF50',
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
    },
    profileInfo: {
        alignItems: "center",
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
    },
    avatar: {
        width: 100,
        height: 100,
    },
    defaultAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
    },
    section: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(56, 142, 60, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionText: {
        fontSize: 16,
        color: "#333",
        flex: 1,
    },
    infoItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(56, 142, 60, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 16,
        color: "#333",
    },
    editButton: {
        padding: 5,
    },
    input: {
        marginTop: 10,
        backgroundColor: "#FFF",
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: "#388E3C",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#D32F2F",
        margin: 20,
        padding: 15,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        marginTop: 50,
    },
    avatarCircle: {
        backgroundColor: "#E8F5E9",
        borderRadius: 100,
        width: 200,
        height: 200,
        marginBottom: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    greeting: {
        fontSize: 20,
        textAlign: "center",
        color: "#388E3C",
        marginBottom: 30,
        lineHeight: 28,
    },
    registerButton: {
        width: "100%",
        backgroundColor: "#43A047",
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    loginButton: {
        marginTop: 10,
    },
    loginText: {
        color: "#388E3C",
        fontSize: 16,
    },
    containerCentered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F8F5",
    },
    cartSliderContainer: {
        marginTop: 10,
    },
    cartItem: {
        width: 150,
        marginRight: 15,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cartItemImage: {
        width: "100%",
        height: 100,
        borderRadius: 5,
        marginBottom: 10,
    },
    cartItemName: {
        fontSize: 14,
        color: "#333",
        marginBottom: 5,
    },
    cartItemPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#388E3C",
    },
});

export default ProfileScreen;