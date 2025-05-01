// components/TestWebView.js
import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';

const TestWebView = () => {
  // Загрузка HTML файла
  const [htmlUri, setHtmlUri] = React.useState(null);

  React.useEffect(() => {
    const loadHtml = async () => {
      try {
        const asset = Asset.fromModule(require('../assets/web/test-viewer.html'));
        await asset.downloadAsync();
        setHtmlUri(asset.localUri);
      } catch (error) {
        console.error('Error loading HTML:', error);
      }
    };
    loadHtml();
  }, []);

  if (!htmlUri) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: htmlUri }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default TestWebView;