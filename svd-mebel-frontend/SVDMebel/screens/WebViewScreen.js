import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const WebPageScreen = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://192.168.230.67:443/web/ar.html' }} // твой локальный сервер
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
};

export default WebPageScreen;