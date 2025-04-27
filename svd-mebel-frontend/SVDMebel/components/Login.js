import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
        const response = await axios.post("http://192.168.93.67:5000/auth/login", {
            email,
            password,
        });

        const { token, user } = response.data;
        await AsyncStorage.setItem("token", token); // Сохраняем токен
        await AsyncStorage.setItem("userId", user.id.toString()); 

        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }], // Переход на главный экран
        });
      }
     catch (error) {
        alert("Ошибка входа");
    }
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Вход</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        placeholderTextColor="#aaa"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Войти</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>Нет аккаунта? <Text style={styles.registerLink}>Зарегистрируйтесь</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#EAF7EA", // мягкий зелёный фон
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1FA915", // насыщенный зелёный
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#F0FFF0", // очень светлый зелёный
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#C8E6C9", // мягкая зелёная граница
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1FA915", // основной зелёный
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  bottomTextContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  bottomText: {
    fontSize: 14,
    color: "#555",
  },
  registerLink: {
    color: "#1FA915",
    fontWeight: "bold",
  },
});



export default Login;
