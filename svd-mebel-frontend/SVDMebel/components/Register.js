import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";

const Register = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://192.168.8.100:5000/auth/register", {
        name,
        email,
        password,
      });
      alert(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Ошибка регистрации");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Создайте аккаунт</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Имя"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Зарегистрироваться</Text>
      </TouchableOpacity>

      {/* Ссылка на логин внизу */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>Уже есть аккаунт? <Text style={styles.loginLink}>Войдите</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#FFF",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF6600",
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
    color: "#666",
  },
  loginLink: {
    color: "#FF6600",
    fontWeight: "bold",
  },
});

export default Register;
