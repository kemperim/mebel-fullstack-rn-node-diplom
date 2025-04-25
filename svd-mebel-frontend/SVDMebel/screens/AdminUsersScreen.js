import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from "react-native";
import Modal from "react-native-modal";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get("http://192.168.92.67:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const updateUser = async () => {
    if (!selectedUser) return;
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Отправка обновления пользователя:", selectedUser);
      await axios.put(
        `http://192.168.92.67:5000/admin/users/${selectedUser.id}`,
        {
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          phone: selectedUser.phone,
          address: selectedUser.address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Успех", "Данные пользователя обновлены");
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error.response?.data || error.message);
    }
  };
  

  const toggleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `http://192.168.92.67:5000/admin/users/${selectedUser.id}/block`,
        { isBlocked: !selectedUser.isBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Ошибка при блокировке пользователя:", error);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
  
    Alert.alert("Удаление", "Вы уверены, что хотите удалить пользователя?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(`http://192.168.92.67:5000/admin/users/${selectedUser.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
  
            Alert.alert("Успех", "Пользователь удален");
            fetchUsers(); // Обновляем список пользователей
            closeModal(); // Закрываем модалку
          } catch (error) {
            console.error("Ошибка при удалении пользователя:", error);
            Alert.alert("Ошибка", "Не удалось удалить пользователя");
          }
        },
      },
    ]);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список пользователей</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6600" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.userItem} onPress={() => openModal(item)}>
              <Text style={styles.userText}>
                {item.name} ({item.role}) {item.isBlocked ? "🚫" : "✅"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Модальное окно */}
      <Modal isVisible={modalVisible} onBackdropPress={closeModal} animationIn="slideInUp" animationOut="slideOutDown">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Детали пользователя</Text>

          {selectedUser && (
            <>
              <TextInput
                style={styles.input}
                value={selectedUser.name}
                onChangeText={(text) => setSelectedUser({ ...selectedUser, name: text })}
                placeholder="Имя"
              />
              <TextInput
                style={styles.input}
                value={selectedUser.email}
                placeholder="Email"
                editable={false} // Поле будет только для чтения
                selectTextOnFocus={false} // Не позволит выделять текст
              />

              <TextInput
                style={styles.input}
                value={selectedUser.role}
                onChangeText={(text) => setSelectedUser({ ...selectedUser, role: text })}
                placeholder="Роль"
              />
                 <TextInput
  style={styles.input}
  value={selectedUser.phone}
  onChangeText={(text) => setSelectedUser({ ...selectedUser, phone: text })}
  placeholder="Телефон"
/>
<TextInput
  style={styles.input}
  value={selectedUser.address}
  onChangeText={(text) => setSelectedUser({ ...selectedUser, address: text })}
  placeholder="Адрес"
/>

              <TouchableOpacity style={styles.saveButton} onPress={updateUser}>
                <Text style={styles.buttonText}>Сохранить изменения</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.blockButton, selectedUser.isBlocked && styles.unblockButton]}
                onPress={toggleBlockUser}
              >
                <Text style={styles.buttonText}>
                  {selectedUser.isBlocked ? "Разблокировать" : "Заблокировать"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={deleteUser}>
                <Text style={styles.buttonText}>Удалить пользователя</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
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
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  userText: {
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
  blockButton: {
    backgroundColor: "#FF4444",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  unblockButton: {
    backgroundColor: "#44AA44",
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

export default AdminUsersScreen;
