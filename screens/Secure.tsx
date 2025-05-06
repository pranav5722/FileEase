import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../hooks/reduxHooks';

type LockedFile = {
  name: string;
  uri: string;
};

const SecureFolder: React.FC = () => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [lockedFiles, setLockedFiles] = useState<LockedFile[]>([]);

  useEffect(() => {
    const fetchLockedFiles = async () => {
      try {
        const keys = await SecureStore.getItemAsync('lockedFiles');
        if (keys) {
          const parsed: LockedFile[] = JSON.parse(keys);
          setLockedFiles(parsed);
        }
      } catch (error) {
        console.error('Error loading locked files:', error);
      }
    };

    fetchLockedFiles();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={lockedFiles}
        keyExtractor={(item, index) => item.uri + index}
        renderItem={({ item }) => (
          <View style={[styles.fileItem, { borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
            <Text
              style={[styles.fileText, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>
        )}
        style={{ width: '100%', marginTop: 16 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ color: colors.primary, marginTop: 400, alignSelf: 'center' }}>
            No locked files found.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  fileText: {
    marginLeft: 8,
    flex: 1,
  },
});

export default SecureFolder;
