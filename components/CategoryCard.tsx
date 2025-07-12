import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Category } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';
import { Archive, File, FileText, Image, Music, Video } from 'lucide-react-native';

interface CategoryCardProps {
  category: Category;
  count: number;
  onPress: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, count, onPress }) => {
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  const getIcon = () => {
    switch (category.icon) {
      case 'image':
        return <Image size={28} color="#fff" />;
      case 'video':
        return <Video size={28} color="#fff" />;
      case 'music':
        return <Music size={28} color="#fff" />;
      case 'file-text':
        return <FileText size={28} color="#fff" />;
      case 'archive':
        return <Archive size={28} color="#fff" />;
      default:
        return <File size={28} color="#fff" />;
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
        {getIcon()}
      </View>
      <Text style={[styles.name, { color: theme.text }]}>{category.name}</Text>
      <Text style={[styles.count, { color: theme.subtext }]}>{count} files</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 110,
    height: 140,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    marginRight: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  count: {
    fontSize: 12,
  },
});

export default CategoryCard;