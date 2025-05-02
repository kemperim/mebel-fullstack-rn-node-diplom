import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

                const productResponse = await axios.get(`http://192.168.66.67:5000/products/product/${productId}`);
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
            const response = await axios.put(`http://192.168.66.67:5000/products/edit/${productId}`, formData, {
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
         


            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Основная информация</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Название товара:</Text>
                    <TextInput
                        style={styles.input}
                        value={product.name}
                        onChangeText={value => handleChange('name', value)}
                        placeholder="Введите название товара"
                        placeholderTextColor="#999"
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
                        placeholderTextColor="#999"
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
                        placeholderTextColor="#999"
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
                        placeholderTextColor="#999"
                    />
                </View>
                {/* Добавьте поле для ar_model_path, если необходимо */}
            </View>

            {Object.keys(product.attributes).length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Атрибуты товара</Text>
                    {renderAttributeInputs()}
                </View>
            )}

            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Изображения товара</Text>
                <Text style={styles.label}>Текущие изображения:</Text>
                <ScrollView horizontal style={styles.imageScrollView} showsHorizontalScrollIndicator={false}>
                    {images.map((image, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image
                                source={{ uri: `http://192.168.66.67:5000${image}` }}
                                style={styles.image}
                            />
                            <TouchableOpacity
                                style={styles.deleteImageButton}
                                onPress={() => removeImage(image)}
                            >
                                <Ionicons name="close" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleMultiImagePick}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#4CAF50', '#66BB6A']}
                        style={styles.addImageButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                        <Text style={styles.addImageButtonText}>Добавить изображения</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {newImages.length > 0 && (
                    <>
                        <Text style={styles.label}>Новые изображения:</Text>
                        <ScrollView horizontal style={styles.imageScrollView} showsHorizontalScrollIndicator={false}>
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
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={['#2196F3', '#42A5F5']}
                    style={styles.submitButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons name="save" size={24} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Сохранить изменения</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    errorText: {
        color: '#EF5350',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 24,
        textAlign: 'center',
        color: '#333',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
        letterSpacing: 0.3,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        marginBottom: 8,
        color: '#666',
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    input: {
        height: 52,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    multilineInput: {
        height: 140,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    imageScrollView: {
        marginVertical: 12,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 16,
    },
    deleteImageButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#EF5350',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    addImageButton: {
        marginTop: 16,
        borderRadius: 14,
        overflow: 'hidden',
    },
    addImageButtonGradient: {
        padding: 18,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    addImageButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    submitButton: {
        marginTop: 32,
        borderRadius: 14,
        overflow: 'hidden',
    },
    submitButtonGradient: {
        padding: 18,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default EditProduct;