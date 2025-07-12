import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CloudService } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';
import { Cloud, Droplet, HardDrive } from 'lucide-react-native';

interface CloudServiceCardProps {
  service: CloudService;
  onPress: (service: CloudService) => void;
  isActive: boolean;
}

const CloudServiceCard: React.FC<CloudServiceCardProps> = ({ 
  service, 
  onPress,
  isActive
}) => {
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  const getIcon = () => {
    switch (service.icon) {
      case 'hard-drive':
        return <HardDrive size={24} color={isActive ? '#fff' : theme.primary} />;
      case 'droplet':
        return <Droplet size={24} color={isActive ? '#fff' : theme.primary} />;
      default:
        return <Cloud size={24} color={isActive ? '#fff' : theme.primary} />;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isActive ? theme.primary : theme.card,
          borderColor: isActive ? theme.primary : theme.border
        }
      ]}
      onPress={() => onPress(service)}
      activeOpacity={0.7}
    >
      {getIcon()}
      <Text 
        style={[
          styles.name, 
          { color: isActive ? '#fff' : theme.text }
        ]}
      >
        {service.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12.5,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default CloudServiceCard;