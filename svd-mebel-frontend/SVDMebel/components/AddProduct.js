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
    });

    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://192.168.92.67:5000/category');
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
                    const response = await axios.get(`http://192.168.92.67:5000/subcategory/${categoryId}/subcategories`);
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

    const handleMultiImagePick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert('Разрешение', 'Разрешите доступ к фото');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                setImages(result.assets);
            }
        } catch (error) {
            console.error('Ошибка выбора изображений:', error);
            Alert.alert('Ошибка', 'Не удалось выбрать изображения');
        }
    };

    const validateFields = () => {
        const { name, description, price, stock_quantity, category_id, subcategory_id } = product;

        if (!name.trim()) {
            Alert.alert('Ошибка', 'Введите название товара');
            return false;
        }

        if (!description.trim()) {
            Alert.alert('Ошибка', 'Введите описание товара');
            return false;
        }

        if (!price || isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert('Ошибка', 'Введите корректную цену (больше 0)');
            return false;
        }

        if (!stock_quantity || isNaN(stock_quantity) || parseInt(stock_quantity) < 0) {
            Alert.alert('Ошибка', 'Введите корректное количество на складе (0 или больше)');
            return false;
        }

        if (!category_id) {
            Alert.alert('Ошибка', 'Выберите категорию');
            return false;
        }

        if (!subcategory_id) {
            Alert.alert('Ошибка', 'Выберите подкатегорию');
            return false;
        }

        if (images.length === 0) {
            Alert.alert('Ошибка', 'Пожалуйста, выберите хотя бы одно изображение');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateFields() || isSubmitting) return;
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            
            // Добавляем текстовые данные
            formData.append('name', product.name);
            formData.append('description', product.description);
            formData.append('price', product.price);
            formData.append('stock_quantity', product.stock_quantity);
            formData.append('category_id', product.category_id);
            formData.append('subcategory_id', product.subcategory_id);
            
            if (product.ar_model_path) {
                formData.append('ar_model_path', product.ar_model_path);
            }

            // Добавляем изображения
            images.forEach((image, index) => {
                const filename = image.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                
                formData.append('images', {
                    uri: image.uri,
                    name: `product_${Date.now()}_${index}.${type.split('/')[1] || 'jpg'}`,
                    type: type,
                });
            });

            console.log('Отправляемые данные:', [...formData.entries()]);

            const response = await axios.post('http://192.168.92.67:5000/products/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: (data) => data, // Отключаем преобразование данных axios
            });

            Alert.alert('Успешно', 'Товар добавлен с изображениями');
            console.log('Ответ сервера:', response.data);
            
            // Сброс формы
            setProduct({
                name: '',
                description: '',
                price: '',
                stock_quantity: '',
                ar_model_path: '',
                category_id: null,
                subcategory_id: null,
            });
            setImages([]);
            setSelectedCategory(null);
            setSubcategories([]);
        } catch (err) {
            console.error('Полная ошибка:', err);
            console.error('Ошибка при добавлении товара:', err.response?.data || err.message);
            Alert.alert(
                'Ошибка', 
                err.response?.data?.message || 'Не удалось добавить товар. Проверьте подключение и попробуйте снова.'
            );
        } finally {
            setIsSubmitting(false);
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

            <TouchableOpacity style={styles.button} onPress={handleMultiImagePick}>
                <Text style={styles.buttonText}>Выбрать изображения</Text>
            </TouchableOpacity>

            {images.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                    <Text style={styles.previewText}>Выбрано изображений: {images.length}</Text>
                    <ScrollView horizontal>
                        {images.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img.uri }}
                                style={styles.previewImage}
                                resizeMode="contain" // Убираем обрезку, показываем изображение целиком
                            />
                        ))}
                    </ScrollView>
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
        backgroundColor: '#f0f8ea',
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#386641',
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
        borderColor: '#a7c957',
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
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#8ac926',
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
        backgroundColor: '#386641',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 40,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    imagePreviewContainer: {
        marginTop: 20,
    },
    previewText: {
        fontSize: 16,
        color: '#386641',
        marginBottom: 8,
    },
    previewImage: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 8,
    },
    imageStyle: { // Этот стиль больше не используется для превью
        width: 100,
        height: 100,
        borderRadius: 8,
        marginTop: 5,
    },
});

export default AddProduct;