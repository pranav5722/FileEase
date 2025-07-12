import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';
import { Filter, Search, X } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  onClear,
  placeholder = 'Search files...'
}) => {
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Search size={20} color={theme.subtext} style={styles.searchIcon} />
      
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.subtext}
        value={value}
        onChangeText={onChangeText}
      />
      
      {value ? (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <X size={18} color={theme.subtext} />
        </TouchableOpacity>
      ) : null}
      
      <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
        <Filter size={20} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default SearchBar;