import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const EditProduct = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { productId } = route.params;

    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        ar_model_path: '',
        attributes: {},
    });
    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFirstRender = useRef(true); // Ref для отслеживания первого рендера

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                setError(null);

                const productResponse = await axios.get(`http://192.168.92.67:5000/products/product/${productId}`);
                const productData = productResponse.data;
                console.log('Полученные данные продукта:', productData);
                console.log('Изображения:', productData.images);

                const formattedAttributes = {};
                (productData.attributes || []).forEach(attr => {
                    formattedAttributes[attr.name] = attr.value;
                });

                setProduct({
                    name: productData.name || '',
                    description: productData.description || '',
                    price: String(productData.price || ''),
                    stock_quantity: String(productData.stock_quantity || ''),
                    ar_model_path: productData.ar_model_path || '',
                    attributes: formattedAttributes,
                });

                setImages(productData.images || (productData.image ? [{ image_url: productData.image }] : []));
                console.log('Что будет установлено в images:', productData.images || (productData.image ? [{ image_url: productData.image }] : []));


            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные товара');
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        isFirstRender.current = false; // После первого рендера устанавливаем в false
    }, [productId]);

    const handleChange = (key, value) => {
        setProduct(prev => ({ ...prev, [key]: value }));
    };

    const handleAttributeChange = (attributeName, value) => {
        setProduct(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [attributeName]: value },
        }));
    };

    const handleMultiImagePick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Разрешение', 'Разрешите доступ к фото');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
            });
            if (!result.canceled && result.assets) {
                setNewImages(result.assets);
            }
        } catch (error) {
            console.error('Ошибка выбора изображений:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать изображения');
        }
    };

    const removeImage = (imageUrlToRemove) => {
        setImages(prevImages => prevImages.filter(url => url !== imageUrlToRemove));
        setDeletedImages(prevDeletedImages => [...prevDeletedImages, imageUrlToRemove]);
    };

    const validateFields = () => {
        const { name, description, price, stock_quantity } = product;
        if (!name.trim()) {
            Alert.alert('Ошибка', 'Введите название товара');
            return false;
        }
        if (!description.trim()) {
            Alert.alert('Ошибка', 'Введите описание товара');
            return false;
        }
        if (!price || isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert('Ошибка', 'Введите корректную цену');
            return false;
        }
        if (!stock_quantity || isNaN(stock_quantity) || parseInt(stock_quantity) < 0) {
            Alert.alert('Ошибка', 'Введите корректное количество на складе');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateFields()) return;
    
        console.log('Состояние newImages перед отправкой:', newImages);
    
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('stock_quantity', product.stock_quantity);
        if (product.ar_model_path) formData.append('ar_model_path', product.ar_model_path);
    
        newImages.forEach((image) => {
            console.log('Добавляемое изображение:', image);
            formData.append('newImages', {
                uri: image.uri,
                type: image.mimeType || 'image/jpeg',
                name: image.fileName || `image_${Date.now()}.jpg`,
            });
        });
    
        if (deletedImages.length > 0) {
            formData.append('deletedImages', JSON.stringify(deletedImages));
        }
    
        formData.append('attributes', JSON.stringify(product.attributes));
    
        console.log('Содержимое formData перед отправкой:');
        for (const pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }
    
        try {
            const response = await axios.put(`http://192.168.92.67:5000/products/edit/${productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            Alert.alert('Успешно', 'Товар успешно обновлен!');
            navigation.goBack();
        } catch (error) {
            console.error('Ошибка при редактировании товара:', error);
            Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось обновить товар');
        }
    };
    const renderAttributeInputs = () => {
        return (product.attributes && Object.keys(product.attributes).map(attributeName => {
            const attributeValue = product.attributes[attributeName];

            return (
                <View key={attributeName} style={styles.inputContainer}>
                    <Text style={styles.label}>{attributeName}:</Text>
                    <TextInput
                        style={styles.input}
                        value={attributeValue}
                        onChangeText={(value) => handleAttributeChange(attributeName, value)}
                        placeholder={`Введите ${attributeName}`}
                        placeholderTextColor="#a7c957"
                    />
                </View>
            );
        })) || null;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Загрузка данных товара...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Редактировать товар</Text>

            {Object.keys(product.attributes).length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Атрибуты товара</Text>
                    {renderAttributeInputs()}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Основная информация</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Название товара:</Text>
                    <TextInput
                        style={styles.input}
                        value={product.name}
                        onChangeText={value => handleChange('name', value)}
                        placeholder="Введите название товара"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Описание:</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={product.description}
                        onChangeText={value => handleChange('description', value)}
                        multiline
                        numberOfLines={4}
                        placeholder="Введите описание товара"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Цена:</Text>
                    <TextInput
                        style={styles.input}
                        value={product.price}
                        onChangeText={value => handleChange('price', value)}
                        keyboardType="numeric"
                        placeholder="Введите цену"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Количество на складе:</Text>
                    <TextInput
                        style={styles.input}
                        value={product.stock_quantity}
                        onChangeText={value => handleChange('stock_quantity', value)}
                        keyboardType="numeric"
                        placeholder="Введите количество"
                    />
                </View>
                {/* Добавьте поле для ar_model_path, если необходимо */}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Изображения товара</Text>
                <Text style={styles.label}>Текущие изображения:</Text>
                <ScrollView horizontal style={styles.imageScrollView}>
                    {images.map((image, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image
                                source={{ uri: `http://192.168.92.67:5000${image}` }}
                                style={styles.image}
                            />

                            <TouchableOpacity
                                style={styles.deleteImageButton}
                                onPress={() => removeImage(image)}
                            >
                                <Text style={styles.deleteImageText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleMultiImagePick}
                >
                    <Text style={styles.addImageButtonText}>Добавить изображения</Text>
                </TouchableOpacity>

                {newImages.length > 0 && (
                    <>
                        <Text style={styles.label}>Новые изображения:</Text>
                        <ScrollView horizontal style={styles.imageScrollView}>
                            {newImages.map((image, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: image.uri }}
                                    style={styles.image}
                                />
                            ))}
                        </ScrollView>
                    </>
                )}
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
            >
                <Text style={styles.submitButtonText}>Сохранить изменения</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    section: {
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#444',
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 10,
    },
    imageScrollView: {
        marginVertical: 10,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 10,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    deleteImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteImageText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    addImageButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addImageButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditProduct;