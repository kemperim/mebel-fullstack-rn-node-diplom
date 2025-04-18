import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    ar_model_path: '',
    category_id: '',
    subcategory_id: '',
  });

  const [image, setImage] = useState(null);

  const handleChange = (key, value) => {
    setProduct(prev => ({ ...prev, [key]: value }));
  };

  const handleImagePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/jpeg' });
  
      console.log('Результат выбора файла:', result); // Логируем результат
  
      if (result.type === 'success') {
        const file = result; // Мы получаем сам объект, а не массив
        console.log('Выбран файл:', file);
  
        if (file.uri) {
          console.log('URI файла:', file.uri); // Логируем URI
          setImage(file);
        } else {
          console.log('Ошибка: URI не получен');
          Alert.alert('Ошибка', 'Не удалось получить путь к изображению');
        }
      } else {
        console.log('Файл не выбран');
      }
    } catch (error) {
      console.error('Ошибка выбора изображения:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };
  
  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите изображение');
      return;
    }
  
    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      formData.append(key, value);
    });
  
    if (image) {
      formData.append('image', {
        uri: image.uri,
        name: image.name,
        type: 'image/jpeg', // Убедитесь, что это правильно
      });
    }
  
    try {
      console.log('Отправка данных на сервер...');
      const response = await axios.post('http://192.168.8.100:5000/products/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Ответ сервера:', response.data);
      Alert.alert('Успешно', 'Товар добавлен');
    } catch (err) {
      console.error('Ошибка при добавлении товара:', err.response ? err.response.data : err);
      Alert.alert('Ошибка', 'Не удалось добавить товар');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добавить товар</Text>

      {[{ label: 'Название товара', key: 'name' },
        { label: 'Описание', key: 'description' },
        { label: 'Цена', key: 'price' },
        { label: 'Количество на складе', key: 'stock_quantity' },
        { label: 'Путь к AR модели', key: 'ar_model_path' },
        { label: 'Категория', key: 'category_id' },
        { label: 'Подкатегория', key: 'subcategory_id' }]
        .map(({ label, key }) => (
          <View key={key} style={styles.inputContainer}>
            <Text>{label}</Text>
            <TextInput
              style={styles.input}
              value={product[key]}
              onChangeText={(value) => handleChange(key, value)}
            />
          </View>
        ))}

      <Button title="Выбрать изображение" onPress={handleImagePick} />

      {image && (
        <View style={styles.imagePreview}>
          <Text>Выбрано изображение:</Text>
          <Image source={{ uri: image.uri }} style={styles.image} />
        </View>
      )}

      <Button title="Добавить товар" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f8f8', flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  inputContainer: { marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  imagePreview: { marginTop: 16, alignItems: 'center' },
  image: { width: 100, height: 100, marginTop: 8, borderRadius: 8 },
});

export default AddProduct;
