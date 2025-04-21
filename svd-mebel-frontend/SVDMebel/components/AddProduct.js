import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // Import Picker

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    ar_model_path: '',
    category_id: null,
    subcategory_id: null,
  });
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://192.168.8.100:5000/category');
        setCategories(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить категории');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async (categoryId) => {
      if (categoryId) {
        try {
          const response = await axios.get(`http://192.168.8.100:5000/subcategory/${categoryId}/subcategories`);
          setSubcategories(response.data);
        } catch (error) {
          console.error('Ошибка при загрузке подкатегорий:', error);
          Alert.alert('Ошибка', 'Не удалось загрузить подкатегории');
        }
      } else {
        setSubcategories([]);
        setProduct(prev => ({ ...prev, subcategory_id: null }));
      }
    };

    fetchSubcategories(selectedCategory);
  }, [selectedCategory]);

  const handleChange = (key, value) => {
    setProduct(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setProduct(prev => ({ ...prev, category_id: categoryId, subcategory_id: null }));
  };

  const handleSubcategoryChange = (subcategoryId) => {
    setProduct(prev => ({ ...prev, subcategory_id: subcategoryId }));
  };

  const handleImagePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/jpeg' });
      if (result.type === 'success') {
        setImage(result);
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
        type: 'image/jpeg',
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Добавить товар</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Категория:</Text>
        <Picker
          selectedValue={selectedCategory}
          style={styles.picker}
          onValueChange={(itemValue) => handleCategoryChange(itemValue)}
        >
          <Picker.Item label="Выберите категорию" value={null} />
          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.name} value={category.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Подкатегория:</Text>
        <Picker
          selectedValue={product.subcategory_id}
          style={styles.picker}
          onValueChange={(itemValue) => handleSubcategoryChange(itemValue)}
          enabled={selectedCategory !== null && subcategories.length > 0}
        >
          <Picker.Item label="Выберите подкатегорию" value={null} />
          {subcategories.map((subcategory) => (
            <Picker.Item key={subcategory.id} label={subcategory.name} value={subcategory.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Название товара:</Text>
        <TextInput
          style={styles.input}
          value={product.name}
          onChangeText={(value) => handleChange('name', value)}
          placeholder="Введите название товара"
          placeholderTextColor="#a7c957"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Описание:</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={product.description}
          onChangeText={(value) => handleChange('description', value)}
          multiline
          numberOfLines={3}
          placeholder="Введите описание товара"
          placeholderTextColor="#a7c957"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Цена:</Text>
        <TextInput
          style={styles.input}
          value={product.price}
          onChangeText={(value) => handleChange('price', value)}
          keyboardType="numeric"
          placeholder="Введите цену товара"
          placeholderTextColor="#a7c957"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Количество на складе:</Text>
        <TextInput
          style={styles.input}
          value={product.stock_quantity}
          onChangeText={(value) => handleChange('stock_quantity', value)}
          keyboardType="numeric"
          placeholder="Введите количество на складе"
          placeholderTextColor="#a7c957"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Путь к AR модели:</Text>
        <TextInput
          style={styles.input}
          value={product.ar_model_path}
          onChangeText={(value) => handleChange('ar_model_path', value)}
          placeholder="Введите путь к AR модели (если есть)"
          placeholderTextColor="#a7c957"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleImagePick}>
        <Text style={styles.buttonText}>Выбрать изображение</Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imagePreview}>
          <Text style={styles.previewText}>Выбрано изображение:</Text>
          <Image source={{ uri: image.uri }} style={styles.imageStyle} />
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Добавить товар</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f8ea', // Нежный светло-зеленый фон
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#386641', // Темно-зеленый заголовок
  },
  label: {
    fontSize: 16,
    color: '#386641',
    marginBottom: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#a7c957', // Светло-зеленая граница
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: '#fff',
    color: '#386641',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#a7c957',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
    color: '#386641',
  },
  button: {
    backgroundColor: '#8ac926', // Яркий зеленый для кнопки выбора изображения
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#386641', // Темно-зеленый для кнопки добавления товара
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom:40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',

  },
  imagePreview: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    color: '#386641',
    marginBottom: 8,
  },
  imageStyle: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 5,
  },
});

export default AddProduct;