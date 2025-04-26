import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Демо-данные
const demoOrders = [
    { id: 1, total_price: 15000, status: 'completed', created_at: new Date(2024, 2, 1) },
    { id: 2, total_price: 25000, status: 'pending', created_at: new Date(2024, 2, 2) },
    { id: 3, total_price: 18000, status: 'completed', created_at: new Date(2024, 2, 3) },
    { id: 4, total_price: 32000, status: 'canceled', created_at: new Date(2024, 2, 4) },
    { id: 5, total_price: 21000, status: 'completed', created_at: new Date(2024, 2, 5) },
    { id: 6, total_price: 28000, status: 'pending', created_at: new Date(2024, 2, 6) },
    { id: 7, total_price: 19000, status: 'completed', created_at: new Date(2024, 2, 7) },
    { id: 8, total_price: 24000, status: 'completed', created_at: new Date(2024, 2, 8) },
    { id: 9, total_price: 17000, status: 'pending', created_at: new Date(2024, 2, 9) },
    { id: 10, total_price: 29000, status: 'completed', created_at: new Date(2024, 2, 10) },
    { id: 11, total_price: 22000, status: 'canceled', created_at: new Date(2024, 2, 11) },
    { id: 12, total_price: 26000, status: 'completed', created_at: new Date(2024, 2, 12) },
    { id: 13, total_price: 20000, status: 'pending', created_at: new Date(2024, 2, 13) },
    { id: 14, total_price: 31000, status: 'completed', created_at: new Date(2024, 2, 14) },
    { id: 15, total_price: 23000, status: 'completed', created_at: new Date(2024, 2, 15) },
];

const OrderStatistics = () => {
    const [orders, setOrders] = useState(demoOrders);
    const [loading, setLoading] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState('week');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const calculateStatistics = () => {
        const totalOrders = orders.length;
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        const totalAmount = orders.reduce((sum, order) => sum + order.total_price, 0);
        const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

        return {
            totalOrders,
            statusCounts,
            totalAmount,
            averageOrderValue,
        };
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#FFC107',
            'completed': '#4CAF50',
            'canceled': '#F44336',
        };
        return colors[status] || '#999';
    };

    const renderStatCard = (title, value, icon, color) => (
        <Animated.View 
            style={[
                styles.statCard,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <LinearGradient
                colors={[color, `${color}99`]}
                style={styles.statCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </LinearGradient>
        </Animated.View>
    );

    const renderStatusPieChart = () => {
        const { statusCounts } = calculateStatistics();
        const data = Object.entries(statusCounts).map(([status, count]) => ({
            name: status,
            population: count,
            color: getStatusColor(status),
            legendFontColor: '#333',
            legendFontSize: 12,
        }));

        return (
            <Animated.View 
                style={[
                    styles.chartContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <Text style={styles.chartTitle}>Распределение по статусам</Text>
                <PieChart
                    data={data}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            </Animated.View>
        );
    };

    const renderTimeChart = () => {
        const timeData = {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                data: [3, 2, 4, 1, 3, 2, 5],
            }],
        };

        return (
            <Animated.View 
                style={[
                    styles.chartContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <Text style={styles.chartTitle}>Заказы по дням</Text>
                <LineChart
                    data={timeData}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                    }}
                    bezier
                    style={styles.chart}
                />
            </Animated.View>
        );
    };

    const stats = calculateStatistics();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Статистика заказов</Text>
                <View style={styles.timeRangeSelector}>
                    <TouchableOpacity
                        style={[styles.timeButton, selectedTimeRange === 'week' && styles.timeButtonActive]}
                        onPress={() => setSelectedTimeRange('week')}
                    >
                        <Text style={[styles.timeButtonText, selectedTimeRange === 'week' && styles.timeButtonTextActive]}>
                            Неделя
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.timeButton, selectedTimeRange === 'month' && styles.timeButtonActive]}
                        onPress={() => setSelectedTimeRange('month')}
                    >
                        <Text style={[styles.timeButtonText, selectedTimeRange === 'month' && styles.timeButtonTextActive]}>
                            Месяц
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.timeButton, selectedTimeRange === 'year' && styles.timeButtonActive]}
                        onPress={() => setSelectedTimeRange('year')}
                    >
                        <Text style={[styles.timeButtonText, selectedTimeRange === 'year' && styles.timeButtonTextActive]}>
                            Год
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsGrid}>
                {renderStatCard('Всего заказов', stats.totalOrders, 'cart', '#2196F3')}
                {renderStatCard('Общая сумма', `${stats.totalAmount.toLocaleString('ru-RU')} ₸`, 'cash', '#4CAF50')}
                {renderStatCard('Средний чек', `${stats.averageOrderValue.toLocaleString('ru-RU')} ₸`, 'trending-up', '#FFC107')}
                {renderStatCard('Активные', Object.values(stats.statusCounts).reduce((a, b) => a + b, 0), 'time', '#9C27B0')}
            </View>

            {renderTimeChart()}
            {renderStatusPieChart()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    timeRangeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    timeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    timeButtonActive: {
        backgroundColor: '#2196F3',
    },
    timeButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    timeButtonTextActive: {
        color: '#FFFFFF',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statCardGradient: {
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginVertical: 8,
    },
    statTitle: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        textAlign: 'center',
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

export default OrderStatistics;