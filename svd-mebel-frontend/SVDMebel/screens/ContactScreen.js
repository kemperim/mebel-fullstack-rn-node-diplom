// screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const openUrl = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
   

      {/* Контактная информация блоки */}
      <View style={styles.contactCard}>
        <Text style={styles.cardHeader}>Адрес</Text>
        <View style={styles.contactItem}>
          <Ionicons name="location-sharp" size={24} color="#3C8D5B" />
          <Text style={styles.contactText}>Улица Примерная, дом 123, Город, Страна</Text>
        </View>
      </View>

      <View style={styles.contactCard}>
        <Text style={styles.cardHeader}>Телефон</Text>
        <View style={styles.contactItem}>
          <Ionicons name="call-sharp" size={24} color="#3C8D5B" />
          <TouchableOpacity onPress={() => openUrl('tel:+1234567890')}>
            <Text style={styles.contactText}>+1 (234) 567-890</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contactCard}>
        <Text style={styles.cardHeader}>Электронная почта</Text>
        <View style={styles.contactItem}>
          <Ionicons name="mail-sharp" size={24} color="#3C8D5B" />
          <TouchableOpacity onPress={() => openUrl('mailto:contact@example.com')}>
            <Text style={styles.contactText}>contact@example.com</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Социальные сети блок */}
      <View style={styles.socialCard}>
        <Text style={styles.socialHeader}>Мы в социальных сетях:</Text>
        <View style={styles.socialIcons}>
          <TouchableOpacity onPress={() => openUrl('https://www.facebook.com')}>
            <Ionicons name="logo-facebook" size={32} color="#3C8D5B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openUrl('https://www.instagram.com')}>
            <Ionicons name="logo-instagram" size={32} color="#3C8D5B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openUrl('https://www.twitter.com')}>
            <Ionicons name="logo-twitter" size={32} color="#3C8D5B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F9F4',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3C8D5B',
    textAlign: 'center',
    marginBottom: 30,
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3C8D5B',
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
  socialCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  socialHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3C8D5B',
    marginBottom: 10,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '50%',
    alignSelf: 'center',
  },
});

export default HomeScreen;
