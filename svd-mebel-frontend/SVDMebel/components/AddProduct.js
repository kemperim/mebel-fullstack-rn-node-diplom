import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddProduct = () => {
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        ar_model_path: '',
        category_id: null,
        subcategory_id: null,
        attributes: {}, // добавляем атрибуты для товара
    });

    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [attributes, setAttributes] = useState([]); // атрибуты, специфичные для подкатегории
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log('Начинаем загрузку категорий...');
                const response = await axios.get('http://192.168.93.67:5000/category');
                console.log('Категории загружены:', response.data);
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
                    console.log('Начинаем загрузку подкатегорий для категории:', categoryId);
                    const response = await axios.get(`http://192.168.93.67:5000/subcategory/${categoryId}/subcategories`);
                    console.log('Подкатегории загружены:', response.data);
                    setSubcategories(response.data);
                    setProduct(prev => ({ ...prev, subcategory_id: null })); // Сбрасываем подкатегорию при смене категории
                    setAttributes([]); // Очищаем атрибуты при смене категории
                } catch (error) {
                    console.error('Ошибка при загрузке подкатегорий:', error);
                    Alert.alert('Ошибка', 'Не удалось загрузить подкатегории');
                }
            } else {
                console.log('Категория не выбрана, сбрасываем подкатегории и атрибуты.');
                setSubcategories([]);
                setProduct(prev => ({ ...prev, subcategory_id: null }));
                setAttributes([]); // очищаем атрибуты
            }
        };
        fetchSubcategories(selectedCategory);
    }, [selectedCategory]);

    useEffect(() => {
        const fetchAttributes = async (subcategoryId) => {
            if (subcategoryId) {
                try {
                    console.log('Начинаем загрузку атрибутов для подкатегории:', subcategoryId);
                    const response = await axios.get(`http://192.168.93.67:5000/products/attributes/subcategory/${subcategoryId}`);
                    console.log('Атрибуты загружены:', response.data);
                    setAttributes(response.data);
                    // Сбрасываем значения атрибутов при смене подкатегории
                    const initialAttributes = {};
                    response.data.forEach(attr => {
                        initialAttributes[attr.name] = '';
                    });
                    setProduct(prev => ({ ...prev, attributes: initialAttributes }));
                } catch (error) {
                    console.error('Ошибка при загрузке атрибутов:', error);
                    Alert.alert('Ошибка', 'Не удалось загрузить атрибуты');
                }
            } else {
                console.log('Подкатегория не выбрана, сбрасываем атрибуты.');
                setAttributes([]);
                setProduct(prev => ({ ...prev, attributes: {} }));
            }
        };
        fetchAttributes(product.subcategory_id);
    }, [product.subcategory_id]);

    const handleChange = (key, value) => {
        setProduct(prev => ({ ...prev, [key]: value }));
        console.log(`Изменено поле ${key}:`, value);
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setProduct(prev => ({ ...prev, category_id: categoryId, subcategory_id: null }));
        console.log('Выбрана категория:', categoryId);
    };

    const handleSubcategoryChange = (subcategoryId) => {
        setProduct(prev => ({ ...prev, subcategory_id: subcategoryId }));
        console.log('Выбрана подкатегория:', subcategoryId);
    };

    const handleAttributeChange = (attributeName, value) => {
        setProduct(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [attributeName]: value },
        }));
        console.log(`Изменен атрибут ${attributeName}:`, value);
    };

    const handleMultiImagePick = async () => {
        try {
            console.log('Запрос разрешения на доступ к медиатеке...');
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert('Разрешение', 'Разрешите доступ к фото');
                console.log('Доступ к медиатеке не предоставлен.');
                return;
            }
            console.log('Доступ к медиатеке предоставлен.');

            console.log('Открываем библиотеку изображений...');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                console.log('Выбраны изображения:', result.assets);
                setImages(result.assets);
            } else {
                console.log('Выбор изображений отменен.');
            }
        } catch (error) {
            console.error('Ошибка выбора изображений:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать изображения');
        }
    };

    const validateFields = () => {
        const { name, description, price, stock_quantity, category_id, subcategory_id, attributes } = product;
        let isValid = true;

        if (!name.trim()) {
            Alert.alert('Ошибка', 'Введите название товара');
            isValid = false;
        }

        if (!description.trim()) {
            Alert.alert('Ошибка', 'Введите описание товара');
            isValid = false;
        }

        if (!price || isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert('Ошибка', 'Введите корректную цену (больше 0)');
            isValid = false;
        }

        if (!stock_quantity || isNaN(stock_quantity) || parseInt(stock_quantity) < 0) {
            Alert.alert('Ошибка', 'Введите корректное количество на складе (0 или больше)');
            isValid = false;
        }

        if (!category_id) {
            Alert.alert('Ошибка', 'Выберите категорию');
            isValid = false;
        }

        if (!subcategory_id) {
            Alert.alert('Ошибка', 'Выберите подкатегорию');
            isValid = false;
        }

        for (let attributeName in product.attributes) {
            if (!product.attributes[attributeName]) {
                Alert.alert('Ошибка', `Заполните атрибут ${attributeName}`);
                isValid = false;
                break;
            }
        }
        

        if (images.length === 0) {
            Alert.alert('Ошибка', 'Пожалуйста, выберите хотя бы одно изображение');
            isValid = false;
        }

        console.log('Результат валидации полей:', isValid);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateFields()) return;
    
        try {
            const formData = new FormData();
    
            // Основные поля товара
            formData.append('name', product.name);
            formData.append('description', product.description);
            formData.append('price', product.price);
            formData.append('stock_quantity', product.stock_quantity);
            formData.append('category_id', product.category_id);
            formData.append('subcategory_id', product.subcategory_id);
            
            if (product.ar_model_path) {
                formData.append('ar_model_path', product.ar_model_path);
            }
    
            // Добавляем атрибуты как JSON-строку
            const attributesData = {};
            attributes.forEach(attr => {
                attributesData[attr.id] = product.attributes[attr.name] || '';
            });
            formData.append('attributes', JSON.stringify(attributesData));
    
            // Добавляем изображения
            images.forEach((image, index) => {
                formData.append('images', {
                    uri: image.uri,
                    name: image.fileName || `image_${index}.jpg`,
                    type: image.mimeType || 'image/jpeg',
                });
            });
    
            // Логирование для отладки
            console.log('Отправляемые данные:');
            console.log('Основные данные:', {
                name: product.name,
                description: product.description,
                price: product.price,
                stock_quantity: product.stock_quantity,
                category_id: product.category_id,
                subcategory_id: product.subcategory_id,
                ar_model_path: product.ar_model_path,
            });
            console.log('Атрибуты:', attributesData);
            console.log('Количество изображений:', images.length);
    
            const response = await axios.post('http://192.168.93.67:5000/products/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            console.log('Ответ сервера:', response.data);
            Alert.alert('Успешно', 'Товар успешно добавлен!');
            
            // Сброс формы после успешной отправки
            setProduct({
                name: '',
                description: '',
                price: '',
                stock_quantity: '',
                ar_model_path: '',
                category_id: null,
                subcategory_id: null,
                attributes: {},
            });
            setImages([]);
            setSelectedCategory(null);
            
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error);
            console.error('Детали ошибки:', error.response?.data);
            Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось добавить товар');
        }
    };
    
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Добавить товар</Text>

            <View style={styles.section}>
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Категория:</Text>
                    <Picker
                        selectedValue={selectedCategory}
                        style={styles.picker}
                        onValueChange={handleCategoryChange}
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
                        onValueChange={handleSubcategoryChange}
                        enabled={selectedCategory !== null && subcategories.length > 0}
                    >
                        <Picker.Item label="Выберите подкатегорию" value={null} />
                        {subcategories.map((subcategory) => (
                            <Picker.Item key={subcategory.id} label={subcategory.name} value={subcategory.id} />
                        ))}
                    </Picker>
                </View>
            </View>

            {attributes.length > 0 && (
                <View style={styles.section}>
                    {attributes.map((attribute) => (
                        <View key={attribute.id} style={styles.inputContainer}>
                            <Text style={styles.label}>{attribute.name}:</Text>
                            <TextInput
                                style={styles.input}
                                value={product.attributes[attribute.name] || ''}
                                onChangeText={(value) => handleAttributeChange(attribute.name, value)}
                                placeholder={`Введите ${attribute.name}`}
                                placeholderTextColor="#999"
                            />
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.section}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Название товара:</Text>
                    <TextInput
                        style={styles.input}
                        value={product.name}
                        onChangeText={(value) => handleChange('name', value)}
                        placeholder="Введите название товара"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Описание:</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={product.description}
                        onChangeText={(value) => handleChange('description', value)}
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
                        onChangeText={(value) => handleChange('price', value)}
                        keyboardType="numeric"
                        placeholder="Введите цену товара"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Количество на складе:</Text>
                    <TextInput
                        style={styles.input}
                        value={product.stock_quantity}
                        onChangeText={(value) => handleChange('stock_quantity', value)}
                        keyboardType="numeric"
                        placeholder="Введите количество товара"
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            <View style={styles.section}>
                <TouchableOpacity 
                    onPress={handleMultiImagePick} 
                    style={styles.button}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#4CAF50', '#66BB6A']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="images" size={24} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Выбрать изображения</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {images.length > 0 && (
                    <ScrollView 
                        horizontal 
                        style={styles.imagePreviewContainer}
                        showsHorizontalScrollIndicator={false}
                    >
                        {images.map((image, index) => (
                            <View key={index} style={{ position: 'relative' }}>
                                <Image
                                    source={{ uri: image.uri }}
                                    style={styles.imagePreview}
                                />
                                <TouchableOpacity
                                    style={styles.imageDeleteButton}
                                    onPress={() => {
                                        const newImages = [...images];
                                        newImages.splice(index, 1);
                                        setImages(newImages);
                                    }}
                                >
                                    <Ionicons name="close" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            <TouchableOpacity 
                onPress={handleSubmit} 
                style={styles.button}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={['#2196F3', '#42A5F5']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons name="add-circle" size={24} color="#FFFFFF" />
             
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8F9FA',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 24,
        color: '#333',
        letterSpacing: 0.5,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    picker: {
        height: 52,
        borderColor: '#E0E0E0',
        borderWidth: 1.5,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        marginVertical: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 52,
        borderColor: '#E0E0E0',
        borderWidth: 1.5,
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
    button: {
        borderRadius: 14,
        overflow: 'hidden',
        marginVertical: 10,
    },
    buttonGradient: {
        padding: 18,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom:20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    imagePreviewContainer: {
        marginVertical: 16,
        paddingVertical: 8,
        flexDirection: 'row',
    },
    imagePreview: {
        width: 140,
        height: 140,
        borderRadius: 16,
        marginRight: 16,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },
    imageDeleteButton: {
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
});

export default AddProduct;