import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';
import { FileItem } from '../types';

interface RenameModalProps {
  file: FileItem | null;
  visible: boolean;
  onClose: () => void;
  onRename: (file: FileItem, newName: string) => void;
}

const RenameModal: React.FC<RenameModalProps> = ({
  file,
  visible,
  onClose,
  onRename,
}) => {
  const [newName, setNewName] = useState('');
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  useEffect(() => {
    if (file) {
      setNewName(file.name);
    }
  }, [file]);
  
  const handleRename = () => {
    if (!file || !newName.trim()) return;
    onRename(file, newName);
    onClose();
  };
  
  if (!file) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Rename</Text>
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }
            ]}
            placeholder="Enter new name"
            placeholderTextColor={theme.subtext}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.renameButton, 
                { backgroundColor: theme.primary },
                !newName.trim() && { opacity: 0.6 }
              ]}
              onPress={handleRename}
              disabled={!newName.trim() || newName === file.name}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Rename</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
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
  renameButton: {
    backgroundColor: '#4A6FFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RenameModal;