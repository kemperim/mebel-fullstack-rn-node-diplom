import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Установи: npm install @expo/vector-icons

const AdminPanelScreen = ({ navigation }) => {
  const menuItems = [
    { title: "Пользователи", icon: "people-outline", screen: "AdminUsers" },
    { title: "Заказы", icon: "cart-outline", screen: "AdminOrders" },
    { title: "Товары", icon: "cube-outline", screen: "AdminAllProducts" },
    { title: "Статистика", icon: "bar-chart-outline", screen: "AdminStatistics" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Админ-панель</Text>

      {menuItems.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.menuItem} 
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons name={item.icon} size={24} color="#007AFF" style={styles.icon} />
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default AdminPanelScreen;
