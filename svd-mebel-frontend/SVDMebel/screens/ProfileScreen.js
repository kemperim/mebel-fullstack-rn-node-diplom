import React, { useState, useEffect } from "react";
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Animated 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons"; // Иконки

const scaleAnim = new Animated.Value(0.8);

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
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
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);  // Очистить данные пользователя
    navigation.navigate("Login");
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Верхняя строка */}
      <View style={styles.header}>
        <Text style={styles.userName}>{user ? user.name : "Гость"}</Text>
        
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

      {/* Аватар */}
      <Animated.View style={[styles.avatarCircle, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={require("../assets/logo.png")} style={styles.avatar} />
      </Animated.View>

      {user ? (
        <>
          <Text style={styles.email}>{user.email}</Text>

          {/* Разделы профиля */}
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Orders")}>
            <Text style={styles.itemText}>📦 Мои заказы</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Address")}>
            <Text style={styles.itemText}>📍 Адрес доставки</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Favorites")}>
            <Text style={styles.itemText}>❤️ Избранные товары</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>📞 {user.phone || "+7 777 123 45 67"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>🏠 Магазин: SVD Mebel</Text>
          </TouchableOpacity>

          {/* Выход */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
    gap: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#388E3C",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 15,
  },
  adminIcon: {
    marginRight: 10,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#66BB6A",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  email: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#F1F8E9",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    color: "#388E3C",
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: "#66BB6A",
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  registerButton: {
    backgroundColor: "#66BB6A",
    borderRadius: 12,
    width: "80%",
    paddingVertical: 8,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  greeting: {
    fontSize: 16,
    color: "#66BB6A",
    textAlign: "center",
    marginBottom: 15,
  },
});

export default ProfileScreen;
