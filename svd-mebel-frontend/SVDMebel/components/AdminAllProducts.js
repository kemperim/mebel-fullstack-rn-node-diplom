import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AdminAllProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://192.168.59.67:5000/products/products');
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
    };

    const renderItem = ({ item }) => (
        <View style={styles.listItem}>
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                activeOpacity={0.7}
                style={styles.productInfo}
            >
                <View style={styles.imageContainer}>
                    {item.images?.length > 0 || item.image ? (
                        <Image
                            source={{ uri: `http://192.168.59.67:5000${item.image}` }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.noImage}>
                            <Ionicons name="image" size={32} color="#666" />
                        </View>
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{item.price.toLocaleString('ru-RU')} ₽</Text>
                    </View>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleEditProduct(item.id)}
                style={styles.editButton}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.editButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons name="create" size={20} color="#FFF" />
                </LinearGradient>
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
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddProduct')}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.addButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons name="add" size={32} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    listItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    productInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        marginRight: 16,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    noImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    priceContainer: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    editButton: {
        marginLeft: 12,
    },
    editButtonGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    addButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AdminAllProducts;