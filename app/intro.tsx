import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';
import IntroSlide from '../components/IntroSlide';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to FileEase',
    description: 'Your all-in-one file management solution for organizing, sharing, and securing your files.',
    imageUrl: 'https://images.unsplash.com/photo-1586772002130-b0f3daa6288b?q=80&w=1000',
  },
  {
    id: '2',
    title: 'Organize Your Files',
    description: 'Easily categorize, search, and filter your files. Create folders and keep everything in order.',
    imageUrl: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1000',
  },
  {
    id: '3',
    title: 'Cloud Integration',
    description: 'Connect to your favorite cloud services like Google Drive, Dropbox, and OneDrive directly from the app.',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000',
  },
  {
    id: '4',
    title: 'Secure Your Files',
    description: 'Protect sensitive files with biometric authentication and PIN security. Your data stays private.',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000',
  },
];

export default function IntroScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const setFirstLaunch = useSettingsStore(state => state.setFirstLaunch);
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };
  
  const handleSkip = () => {
    handleFinish();
  };
  
  const handleFinish = () => {
    setFirstLaunch(false);
    router.replace('/(tabs)');
  };
  
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };
  
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? theme.primary : theme.border }
            ]}
          />
        ))}
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: theme.primary }]}>Skip</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => (
          <IntroSlide
            title={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      <View style={styles.bottomContainer}>
        {renderDots()}
        
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});