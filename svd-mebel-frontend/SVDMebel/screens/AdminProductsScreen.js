import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AdminProductsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Управление заказами</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default AdminProductsScreen;
