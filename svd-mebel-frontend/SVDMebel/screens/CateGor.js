import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Image, Alert, ActivityIndicator, Text, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const ImageUploadScreen = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const serverUrl = 'http://192.168.92.67:5000'; // Замените на URL вашего сервера

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Разрешение отклонено',
          'Для выбора изображений необходимо предоставить доступ к галерее.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      // allowsEditing: true, // Убрали разрешение на редактирование (обрезку)
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      setImages(result.assets);
    }
  };

  const uploadImagesToServer = async () => {
    if (images.length === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите хотя бы одно изображение.');
      return;
    }

    setUploading(true);

    const base64Images = [];
    for (const image of images) {
      try {
        const base64 = await FileSystem.readAsStringAsync(image.uri, { encoding: 'base64' });
        base64Images.push(base64);
      } catch (error) {
        console.error('Ошибка чтения файла:', error);
        Alert.alert('Ошибка', 'Не удалось прочитать данные одного из изображений.');
        setUploading(false);
        return;
      }
    }

    try {
      const response = await axios.post(serverUrl + '/upload', { images: base64Images }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setUploading(false);

      if (response.status === 200) {
        Alert.alert('Успех', `${images.length} изображений успешно загружены на сервер.`);
        setImages([]);
      } else {
        Alert.alert('Ошибка', `Ошибка загрузки: ${response.data?.message || response.status}`);
      }

    } catch (error) {
      setUploading(false);
      console.error('Ошибка отправки запроса:', error);
      Alert.alert('Ошибка', 'Не удалось отправить изображения на сервер.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Выбрать изображения" onPress={pickImages} />

      {images.length > 0 && (
        <View style={styles.selectedImagesContainer}>
          <Text>Выбрано {images.length} изображений:</Text>
          <ScrollView horizontal>
            {images.map((image, index) => (
              <Image key={index} source={{ uri: image.uri }} style={styles.selectedImage} />
            ))}
          </ScrollView>
          <Button title="Загрузить изображения" onPress={uploadImagesToServer} disabled={uploading} />
        </View>
      )}

      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  selectedImagesContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  selectedImage: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 5,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
});

export default ImageUploadScreen;