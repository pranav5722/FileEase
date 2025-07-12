import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';
import { CATEGORIES } from '../constants/mockData';
import { Check, ChevronDown } from 'lucide-react-native';
import { formatFileSize } from '../utils/fileUtils';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (type: string, advancedFilters?: any) => void;
  currentFilter: string;
  advancedFilters?: {
    sizeMin: number;
    sizeMax: number;
    dateFrom: string | null;
    dateTo: string | null;
  };
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilter,
  currentFilter,
  advancedFilters = {
    sizeMin: 0,
    sizeMax: Infinity,
    dateFrom: null,
    dateTo: null,
  }
}) => {
  const [selectedFilter, setSelectedFilter] = useState(currentFilter);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sizeMin, setSizeMin] = useState(advancedFilters.sizeMin);
  const [sizeMax, setSizeMax] = useState(advancedFilters.sizeMax === Infinity ? 1024 * 1024 * 1024 : advancedFilters.sizeMax); // 1GB default max
  const [dateFrom, setDateFrom] = useState(advancedFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(advancedFilters.dateTo || '');
  
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  const handleApply = () => {
    const filters = {
      sizeMin,
      sizeMax: sizeMax === 0 ? Infinity : sizeMax,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    };
    
    onApplyFilter(selectedFilter, filters);
    onClose();
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      return '';
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Filter Files</Text>
          
          <ScrollView style={styles.content}>
            {/* File Type Filters */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>File Type</Text>
            
            <View style={styles.filterList}>
              <TouchableOpacity
                style={[
                  styles.filterItem,
                  { borderBottomColor: theme.border }
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[styles.filterText, { color: theme.text }]}>All Files</Text>
                {selectedFilter === 'all' && (
                  <Check size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
              
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterItem,
                    { borderBottomColor: theme.border }
                  ]}
                  onPress={() => setSelectedFilter(category.type)}
                >
                  <Text style={[styles.filterText, { color: theme.text }]}>{category.name}</Text>
                  {selectedFilter === category.type && (
                    <Check size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Advanced Filters Toggle */}
            <TouchableOpacity 
              style={[styles.advancedToggle, { borderColor: theme.border }]}
              onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Text style={[styles.advancedToggleText, { color: theme.primary }]}>
                {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </Text>
              <ChevronDown 
                size={20} 
                color={theme.primary} 
                style={{ transform: [{ rotate: showAdvancedFilters ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>
            
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <View style={styles.advancedFilters}>
                {/* File Size Filter */}
                <Text style={[styles.filterGroupTitle, { color: theme.text }]}>File Size</Text>
                
                <View style={styles.sizeFilterContainer}>
                  <View style={styles.sizeInputContainer}>
                    <Text style={[styles.sizeLabel, { color: theme.subtext }]}>Min</Text>
                    <TextInput
                      style={[
                        styles.sizeInput, 
                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      value={sizeMin.toString()}
                      onChangeText={(text) => setSizeMin(parseInt(text) || 0)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.subtext}
                    />
                    <Text style={[styles.sizeUnit, { color: theme.subtext }]}>
                      {formatFileSize(sizeMin)}
                    </Text>
                  </View>
                  
                  <View style={styles.sizeInputContainer}>
                    <Text style={[styles.sizeLabel, { color: theme.subtext }]}>Max</Text>
                    <TextInput
                      style={[
                        styles.sizeInput, 
                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      value={sizeMax === Infinity ? '' : sizeMax.toString()}
                      onChangeText={(text) => setSizeMax(parseInt(text) || 0)}
                      keyboardType="numeric"
                      placeholder="No limit"
                      placeholderTextColor={theme.subtext}
                    />
                    <Text style={[styles.sizeUnit, { color: theme.subtext }]}>
                      {sizeMax === Infinity || sizeMax === 0 ? 'No limit' : formatFileSize(sizeMax)}
                    </Text>
                  </View>
                </View>
                
                {/* Date Filter */}
                <Text style={[styles.filterGroupTitle, { color: theme.text }]}>Date Modified</Text>
                
                <View style={styles.dateFilterContainer}>
                  <View style={styles.dateInputContainer}>
                    <Text style={[styles.dateLabel, { color: theme.subtext }]}>From</Text>
                    <TextInput
                      style={[
                        styles.dateInput, 
                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      value={dateFrom}
                      onChangeText={setDateFrom}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.subtext}
                    />
                  </View>
                  
                  <View style={styles.dateInputContainer}>
                    <Text style={[styles.dateLabel, { color: theme.subtext }]}>To</Text>
                    <TextInput
                      style={[
                        styles.dateInput, 
                        { 
                          backgroundColor: theme.background,
                          color: theme.text,
                          borderColor: theme.border
                        }
                      ]}
                      value={dateTo}
                      onChangeText={setDateTo}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.subtext}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.applyButton, { backgroundColor: theme.primary }]}
              onPress={handleApply}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterList: {
    marginBottom: 16,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  filterText: {
    fontSize: 16,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedFilters: {
    marginTop: 16,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeFilterContainer: {
    marginBottom: 20,
  },
  sizeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sizeLabel: {
    width: 40,
    fontSize: 14,
  },
  sizeInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  sizeUnit: {
    fontSize: 12,
    width: 80,
  },
  dateFilterContainer: {
    marginBottom: 20,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    width: 40,
    fontSize: 14,
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#4A6FFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});