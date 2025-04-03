import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContactsScreen from "./screens/ContactScreen";
import CatalogScreen from "./screens/CatalogScreen";
import CartScreen from "./screens/CartScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AdminPanelScreen from "./screens/AdminPanelScreen";
import { Ionicons } from "@expo/vector-icons";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminUsersScreen from "./screens/AdminUsersScreen";
import AdminOrdersScreen from  "./screens/AdminOrdersScreen";
import AdminProductsScreen from "./screens/AdminProductsScreen";
import AdminStatisticsScreen from "./screens/AdminStatisticsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdminUserDetailsScreen from "./components/AdminUserDetails";
import CategoryScreen from "./screens/categoryScreens";
import SubcategoriesScreen from "./screens/CateGor";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const setAuthToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};
setAuthToken();

// 📌 ГЛАВНАЯ НАВИГАЦИЯ (ТАБЫ)
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: "#FF6600", // 🟠 Оранжевый цвет активных вкладок
      tabBarInactiveTintColor: "#777",  // ⚪ Серый цвет неактивных вкладок
      tabBarStyle: { backgroundColor: "#fff" }, // Фон таб-бара белый
    }}
  >
    <Tab.Screen
      name="Каталог"
      component={CatalogScreen}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Корзина"
      component={CartScreen}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Контакты"
      component={ContactsScreen}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="call" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Профиль"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
      }}
    />
  </Tab.Navigator>
);

// 📌 НАВИГАЦИЯ С ВОЗМОЖНОСТЬЮ ПЕРЕХОДА НА АВТОРИЗАЦИЮ
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 📌 Теперь стартовый экран - Каталог */}
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        <Stack.Screen name="AdminUserDetailsScreen" component={AdminUserDetailsScreen}/>
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
        <Stack.Screen name="AdminProducts" component={AdminProductsScreen} />
        <Stack.Screen name="AdminStatistics" component={AdminStatisticsScreen} />
  

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;