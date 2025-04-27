import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminUserDetailsScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchUserDetails(); // Убираем параметр
  }, []);
  
  const fetchUserDetails = async () => { // Убираем userId из параметров
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`http://192.168.93.67:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data); // Исправлено: setUser вместо setSelectedUser
      setName(response.data.name || ""); 
      setEmail(response.data.email || ""); 
      setRole(response.data.role || ""); 
      setPhone(response.data.phone || ""); 
      setAddress(response.data.address || ""); 
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const updateUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `http://192.168.93.67:5000/admin/users/${userId}`,
        { name, email, role, phone, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Успех", "Данные пользователя обновлены");
      navigation.goBack();
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error);
    }
  };

  const deleteUser = async () => {
    Alert.alert("Удаление", "Вы уверены, что хотите удалить пользователя?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(`http://192.168.93.67:5000/admin/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            navigation.goBack();
          } catch (error) {
            console.error("Ошибка при удалении пользователя:", error);
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#FF6600" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Детали пользователя</Text>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Имя" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder="Роль" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Телефон" />
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Адрес" />
      <TextInput
        style={styles.input}
        value={user.is_verified ? "Подтвержден" : "Не подтвержден"}
        editable={false}
        placeholder="Статус верификации"
      />

      <TouchableOpacity style={styles.saveButton} onPress={updateUser}>
        <Text style={styles.buttonText}>Сохранить изменения</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={deleteUser}>
        <Text style={styles.buttonText}>Удалить пользователя</Text>
      </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#AA0000",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default AdminUserDetailsScreen;
