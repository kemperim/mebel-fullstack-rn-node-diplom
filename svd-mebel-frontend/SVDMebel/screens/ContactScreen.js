// screens/HomeScreen.js
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const ContactScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openUrl = (url) => {
    Linking.openURL(url);
  };

  const renderContactCard = (icon, title, content, isLink = false) => (
    <Animated.View 
      style={[
        styles.contactCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.cardIconContainer}>
        <Ionicons name={icon} size={28} color="#4CAF50" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardHeader}>{title}</Text>
        {isLink ? (
          <TouchableOpacity onPress={() => openUrl(content.startsWith('tel:') ? content : `mailto:${content}`)}>
            <Text style={[styles.contactText, styles.linkText]}>{content.replace(/^(tel:|mailto:)/, '')}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.contactText}>{content}</Text>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContactCard('location-sharp', 'Адрес', 'Улица Примерная, дом 123, Город, Страна')}
        {renderContactCard('call-sharp', 'Телефон', 'tel:+1234567890', true)}
        {renderContactCard('mail-sharp', 'Электронная почта', 'mailto:contact@example.com', true)}

        <Animated.View 
          style={[
            styles.socialCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.socialHeader}>Мы в социальных сетях</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity 
              style={styles.socialIconButton}
              onPress={() => openUrl('https://www.facebook.com')}
            >
              <Ionicons name="logo-facebook" size={32} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialIconButton}
              onPress={() => openUrl('https://www.instagram.com')}
            >
              <Ionicons name="logo-instagram" size={32} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialIconButton}
              onPress={() => openUrl('https://www.twitter.com')}
            >
              <Ionicons name="logo-twitter" size={32} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </Animated.View>

       
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: height * 0.25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  linkText: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  socialCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  socialHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  socialIconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  mapHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    borderStyle: 'dashed',
  },
  mapText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default ContactScreen;
