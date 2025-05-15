import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, Animated, ScrollView } from "react-native";
import Modal from "react-native-modal";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

const AdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchAnim = new Animated.Value(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSearchFocused]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get("http://192.168.59.67:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        `http://192.168.59.67:5000/admin/users/${selectedUser.id}`,
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
        `http://192.168.59.67:5000/admin/users/${selectedUser.id}/block`,
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
            await axios.delete(`http://192.168.59.67:5000/admin/users/${selectedUser.id}`, {
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
      <View style={styles.header}>
        <Text style={styles.title}>Список пользователей</Text>
        <Animated.View style={[
          styles.searchContainer,
          {
            transform: [{
              scale: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02]
              })
            }],
            shadowOpacity: searchAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.2]
            })
          }
        ]}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6600" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userItem} 
              onPress={() => openModal(item)}
              activeOpacity={0.7}
            >
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
              <View style={styles.userStatus}>
                <Text style={styles.userRole}>{item.role}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.isBlocked ? '#FF4444' : '#44AA44' }
                ]}>
                  <Text style={styles.statusText}>
                    {item.isBlocked ? 'Заблокирован' : 'Активен'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей'}
              </Text>
            </View>
          }
        />
      )}

      {/* Модальное окно */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Редактирование пользователя</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedUser && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Имя</Text>
                <TextInput
                  style={styles.modalInput}
                  value={selectedUser.name}
                  onChangeText={(text) => setSelectedUser({ ...selectedUser, name: text })}
                  placeholder="Введите имя"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.modalInput, styles.disabledInput]}
                  value={selectedUser.email}
                  editable={false}
                  placeholder="Email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Роль</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      selectedUser.role === 'admin' && styles.roleButtonActive
                    ]}
                    onPress={() => setSelectedUser({ ...selectedUser, role: 'admin' })}
                  >
                    <Ionicons 
                      name="shield-checkmark" 
                      size={20} 
                      color={selectedUser.role === 'admin' ? '#FFF' : '#666'} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      selectedUser.role === 'admin' && styles.roleButtonTextActive
                    ]}>
                      Администратор
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      selectedUser.role === 'user' && styles.roleButtonActive
                    ]}
                    onPress={() => setSelectedUser({ ...selectedUser, role: 'user' })}
                  >
                    <Ionicons 
                      name="person" 
                      size={20} 
                      color={selectedUser.role === 'user' ? '#FFF' : '#666'} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      selectedUser.role === 'user' && styles.roleButtonTextActive
                    ]}>
                      Пользователь
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Телефон</Text>
                <TextInput
                  style={styles.modalInput}
                  value={selectedUser.phone}
                  onChangeText={(text) => setSelectedUser({ ...selectedUser, phone: text })}
                  placeholder="Введите телефон"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Адрес</Text>
                <TextInput
                  style={styles.modalInput}
                  value={selectedUser.address}
                  onChangeText={(text) => setSelectedUser({ ...selectedUser, address: text })}
                  placeholder="Введите адрес"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={updateUser}
                >
                  <Ionicons name="save" size={20} color="#FFF" style={styles.buttonIcon} />
                  <Text style={styles.actionButtonText}>Сохранить</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.blockButton]}
                  onPress={toggleBlockUser}
                >
                  <Ionicons 
                    name={selectedUser.isBlocked ? "lock-open" : "lock-closed"} 
                    size={20} 
                    color="#FFF" 
                    style={styles.buttonIcon} 
                  />
                  <Text style={styles.actionButtonText}>
                    {selectedUser.isBlocked ? "Разблокировать" : "Заблокировать"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={deleteUser}
                >
                  <Ionicons name="trash" size={20} color="#FFF" style={styles.buttonIcon} />
                  <Text style={styles.actionButtonText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#FFF',
  },
  modalActions: {
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  blockButton: {
    backgroundColor: '#FFA726',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    marginBottom:50,
  },
  buttonIcon: {
    marginRight: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminUsersScreen;
