import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useSettingsStore } from '../../store/settingsStore';
import colors from '../../constants/colors';
import { CLOUD_SERVICES } from '../../constants/mockData';
import CloudServiceCard from '../../components/CloudServiceCard';

export default function CloudScreen() {
  const [selectedService, setSelectedService] = useState(CLOUD_SERVICES[0]);
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  const handleServicePress = (service: any) => {
    setSelectedService(service);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
        >
          {CLOUD_SERVICES.map((service) => (
            <CloudServiceCard
              key={service.id}
              service={service}
              onPress={handleServicePress}
              isActive={selectedService.id === service.id}
            />
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: selectedService.url }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
              <Text style={[styles.loadingText, { color: theme.text }]}>
                Loading {selectedService.name}...
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 50, // Add extra padding at the top since we removed the header
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  servicesContainer: {
    paddingVertical: 8,
  },
  webViewContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});