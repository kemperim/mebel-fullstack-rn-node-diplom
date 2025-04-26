import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Или любая другая библиотека иконок

const AdminAllProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://192.168.92.67:5000/products/products');
                setProducts(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке товаров:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleEditProduct = (productId) => {
        navigation.navigate('EditProduct', { productId: productId });
        console.log(`Редактировать товар с ID: ${productId}`);
    };

    const renderItem = ({ item }) => (
        <View style={styles.listItem}>
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                activeOpacity={0.9}
                style={styles.productInfo}
            >
                {item.images?.length > 0 || item.image ? (
                    <Image
                        source={{ uri: `http://192.168.92.67:5000${item.image}` }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.noImage]}>
                        <Text style={styles.noImageText}>Нет изображения</Text>
                    </View>
                )}
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.price}>{item.price} ₸</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleEditProduct(item.id)}
                style={styles.editButton}
            >
                <Icon name="pencil" size={20} color="#007BFF" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <FlatList
                style={styles.container}
                data={products || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddProduct')}
            >
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        backgroundColor: '#F9F9F9',
        padding: 10
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        flexDirection: 'row', // Располагаем элементы в ряд
        alignItems: 'center', // Выравниваем по вертикали
        justifyContent: 'space-between', // Распределяем пространство между элементами
    },
    productInfo: {
        flex: 1, // Занимает большую часть пространства
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15
    },
    noImage: {
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 100,
        marginRight: 15
    },
    noImageText: {
        color: '#888'
    },
    textContainer: {
        flex: 1, // Занимает оставшееся пространство
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    price: {
        fontSize: 16,
        color: '#4CAF50',
        marginBottom: 3
    },
    description: {
        fontSize: 14,
        color: '#666'
    },
    editButton: {
        padding: 10,
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 30,
    },
});

export default AdminAllProducts;