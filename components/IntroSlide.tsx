import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';

interface IntroSlideProps {
  title: string;
  description: string;
  imageUrl: string;
}

const { width } = Dimensions.get('window');

const IntroSlide: React.FC<IntroSlideProps> = ({ title, description, imageUrl }) => {
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.subtext }]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});

export default IntroSlide;