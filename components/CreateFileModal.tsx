import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';
import { File, Folder } from 'lucide-react-native';

interface CreateFileModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFile: (name: string) => void;
  onCreateFolder: (name: string) => void;
}

const CreateFileModal: React.FC<CreateFileModalProps> = ({
  visible,
  onClose,
  onCreateFile,
  onCreateFolder,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'file' | 'folder'>('folder');
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  const handleCreate = () => {
    if (!name.trim()) return;
    
    if (type === 'file') {
      onCreateFile(name);
    } else {
      onCreateFolder(name);
    }
    
    setName('');
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Create New {type === 'file' ? 'File' : 'Folder'}
          </Text>
          
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'folder' && [styles.selectedType, { borderColor: theme.primary }]
              ]}
              onPress={() => setType('folder')}
            >
              <Folder size={24} color={type === 'folder' ? theme.primary : theme.subtext} />
              <Text 
                style={[
                  styles.typeText, 
                  { color: type === 'folder' ? theme.primary : theme.subtext }
                ]}
              >
                Folder
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'file' && [styles.selectedType, { borderColor: theme.primary }]
              ]}
              onPress={() => setType('file')}
            >
              <File size={24} color={type === 'file' ? theme.primary : theme.subtext} />
              <Text 
                style={[
                  styles.typeText, 
                  { color: type === 'file' ? theme.primary : theme.subtext }
                ]}
              >
                File
              </Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }
            ]}
            placeholder={`Enter ${type} name`}
            placeholderTextColor={theme.subtext}
            value={name}
            onChangeText={setName}
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
                styles.createButton, 
                { backgroundColor: theme.primary },
                !name.trim() && { opacity: 0.6 }
              ]}
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Create</Text>
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
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedType: {
    borderWidth: 2,
  },
  typeText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
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
  createButton: {
    backgroundColor: '#4A6FFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateFileModal;