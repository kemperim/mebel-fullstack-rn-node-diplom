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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

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
                const response = await axios.get('http://192.168.92.67:5000/category');
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
                    const response = await axios.get(`http://192.168.92.67:5000/subcategory/${categoryId}/subcategories`);
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
                    const response = await axios.get(`http://192.168.92.67:5000/products/attributes/subcategory/${subcategoryId}`);
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

        for (let attribute in attributes) {
            if (!attributes[attribute] && attributes.hasOwnProperty(attribute)) {
                const attributeInfo = attributes.find(attr => attr.name === attribute);
                if (attributeInfo) {
                    Alert.alert('Ошибка', `Заполните атрибут ${attributeInfo.name}`);
                    isValid = false;
                    break;
                }
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

            // Отправляем каждый атрибут как отдельное поле
            attributes.forEach(attr => {
                formData.append(`attributes[${attr.id}]`, product.attributes[attr.name] || '');
            });

            // Добавляем изображения
            images.forEach((image, index) => {
                formData.append('images', {
                    uri: image.uri,
                    name: image.fileName || `image_${index}.jpg`,
                    type: image.mimeType || 'image/jpeg',
                });
            });

            console.log('Данные FormData перед отправкой:', Object.fromEntries(formData.entries()));
            console.log('Отправляем POST-запрос на: http://192.168.92.67:5000/products/add');

            const response = await axios.post('http://192.168.92.67:5000/products/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Ответ сервера:', response.data);
            Alert.alert('Успешно', 'Товар успешно добавлен!');
            // ... остальной код сброса формы ...
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error.response?.data || error);
            Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось добавить товар');
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

            {/* Динамические поля для атрибутов подкатегории */}
            {attributes.length > 0 && (
                <View>
                    {attributes.map((attribute) => (
                        <View key={attribute.id} style={styles.inputContainer}>
                            <Text style={styles.label}>{attribute.name}:</Text>
                            <TextInput
                                style={styles.input}
                                value={product.attributes[attribute.name] || ''}
                                onChangeText={(value) => handleAttributeChange(attribute.name, value)}
                                placeholder={`Введите ${attribute.name}`}
                                placeholderTextColor="#a7c957"
                            />
                        </View>
                    ))}
                </View>
            )}

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
                    placeholder="Введите количество товара"
                    placeholderTextColor="#a7c957"
                />
            </View>

            <TouchableOpacity onPress={handleMultiImagePick} style={styles.button}>
                <Text style={styles.buttonText}>Выбрать изображения</Text>
            </TouchableOpacity>

            {images.length > 0 && (
                <ScrollView horizontal style={styles.imagePreviewContainer}>
                    {images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image.uri }}
                            style={styles.imagePreview}
                        />
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                <Text style={styles.buttonText}>Добавить товар</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    pickerContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#555',
    },
    picker: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        marginVertical: 5,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    multilineInput: {
        height: 80,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    imagePreviewContainer: {
        marginVertical: 10,
        paddingVertical: 5,
        flexDirection: 'row',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
});

export default AddProduct;