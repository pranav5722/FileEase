import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  FontAwesome5,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as mime from 'react-native-mime-types';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import moment from 'moment';

import humanFileSize from '../../../utils/Filesize';
import ActionSheet from '../../ActionSheet';
import { fileItem } from '../../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector } from '../../../hooks/reduxHooks';

type Props = {
  item: fileItem;
  currentDir: string;
  multiSelect: boolean;
  toggleSelect: (arg0: fileItem) => void;
  setTransferDialog: (arg0: boolean) => void;
  setMoveOrCopy: (arg0: string) => void;
  deleteSelectedFiles: (arg0?: fileItem) => void;
  setRenamingFile: (arg0: fileItem) => void;
  setRenameDialogVisible: (arg0: boolean) => void;
  setNewFileName: (arg0: string) => void;
};

export default function FileItem({
  item,
  currentDir,
  multiSelect,
  toggleSelect,
  setTransferDialog,
  setMoveOrCopy,
  deleteSelectedFiles,
  setRenamingFile,
  setRenameDialogVisible,
  setNewFileName,
}: Props) {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [itemActionsOpen, setItemActionsOpen] = useState(false);
  const [lockedItems, setLockedItems] = useState<string[]>([]);

  const itemMime = mime.lookup(item.uri) || '';
  const itemType: string = item.isDirectory ? 'dir' : itemMime.split('/')[0];
  const itemFormat: string = item.isDirectory ? 'dir' : itemMime.split('/')[1];

  useEffect(() => {
    SecureStore.getItemAsync('lockedItems').then((data) => {
      if (data) setLockedItems(JSON.parse(data));
    });
  }, []);

  const isLocked = lockedItems.includes(item.uri);

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Secure Folder',
    });
    return result.success;
  };

  const updateLockedItems = async (uri: string) => {
    const alreadyLocked = lockedItems.includes(uri);
    if (alreadyLocked) {
      const success = await authenticate();
      if (!success) return;
      const updated = lockedItems.filter((u) => u !== uri);
      setLockedItems(updated);
      await SecureStore.setItemAsync('lockedItems', JSON.stringify(updated));
    } else {
      const updated = [...lockedItems, uri];
      setLockedItems(updated);
      await SecureStore.setItemAsync('lockedItems', JSON.stringify(updated));
    }
  };

  const onPressHandler = async () => {
    if (!multiSelect) {
      if (isLocked) {
        const success = await authenticate();
        if (!success) return;
      }

      if (item.isDirectory) {
        navigation.push('Browser', {
          folderName: item.name,
          prevDir: currentDir,
        });
      } else if (itemType === 'image') {
        navigation.push('ImageGalleryView', {
          currentImage: item.uri,
          folderName: item.name,
          prevDir: currentDir,
        });
      } else if (itemType === 'video') {
        navigation.push('VideoPlayer', {
          folderName: item.name,
          prevDir: currentDir,
        });
      } else {
        navigation.push('MiscFileView', {
          folderName: item.name,
          prevDir: currentDir,
        });
      }
    } else {
      toggleSelect(item);
    }
  };

  return (
    <View style={styles.container}>
      <ActionSheet
        title={
          multiSelect
            ? 'Choose an action for the selected items'
            : decodeURI(item.name)
        }
        numberOfLinesTitle={multiSelect ? undefined : 1}
        visible={itemActionsOpen}
        actionItems={[
          'Rename',
          'Move',
          'Copy',
          'Share',
          'Delete',
          'Secure Folder',
          'Cancel',
        ]}
        itemIcons={[
          'edit',
          'drive-file-move',
          'file-copy',
          'share',
          'delete',
          'lock',
          'close',
        ]}
        onClose={setItemActionsOpen}
        onItemPressed={async (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              setRenamingFile(item);
              setRenameDialogVisible(true);
              setNewFileName(item.name);
              break;
            case 1:
              setMoveOrCopy('Move');
              if (!multiSelect) toggleSelect(item);
              setTransferDialog(true);
              break;
            case 2:
              setMoveOrCopy('Copy');
              if (!multiSelect) toggleSelect(item);
              setTransferDialog(true);
              break;
            case 3:
              if (await Sharing.isAvailableAsync()) {
                Sharing.shareAsync(item.uri);
              }
              break;
            case 4:
              setTimeout(() => {
                Alert.alert(
                  'Confirm Delete',
                  `Are you sure you want to delete ${
                    multiSelect ? 'selected files' : 'this file'
                  }?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      onPress: () => {
                        if (!multiSelect) deleteSelectedFiles(item);
                        else deleteSelectedFiles();
                      },
                    },
                  ]
                );
              }, 300);
              break;
            case 5:
              await updateLockedItems(item.uri);
              break;
            default:
              break;
          }
        }}
        cancelButtonIndex={6}
        modalStyle={{ backgroundColor: colors.background2 }}
        itemTextStyle={{ color: colors.text }}
        titleStyle={{ color: colors.secondary }}
      />

      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.itemLeft}
          activeOpacity={0.5}
          onPress={onPressHandler}
          onLongPress={() => {
            if (!multiSelect) toggleSelect(item);
          }}
        >
          <View style={styles.itemThumbnail}>
            {itemType === 'image' ? (
              <Image source={{ uri: item.uri }} style={styles.image} />
            ) : isLocked ? (
              <FontAwesome5 name="lock" size={30} color={colors.primary} />
            ) : (
              <FontAwesome5 name="file" size={30} color="#555" />
            )}
          </View>
          <View style={styles.itemDetails}>
            <Text numberOfLines={1} style={{ ...styles.fileName, color: colors.primary }}>
              {decodeURI(item.name)}
            </Text>
            <Text style={{ ...styles.fileDetailText, color: colors.secondary }}>
              {humanFileSize(item.size)}
            </Text>
            <Text style={{ ...styles.fileDetailText, color: colors.secondary }}>
              {moment(item.modificationTime * 1000).fromNow()}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ ...styles.itemActionButton, backgroundColor: colors.background }}>
          <TouchableOpacity onPress={() => setItemActionsOpen(true)}>
            <View style={styles.fileMenu}>
              {!item.selected ? (
                <Feather name="more-horizontal" size={24} color={colors.primary} />
              ) : (
                <Feather name="check-square" size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 75,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  itemLeft: {
    height: '100%',
    width: '83%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemThumbnail: {
    height: '100%',
    marginLeft: 8,
    width: '17%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    width: '83%',
  },
  itemActionButton: {
    width: '8%',
    height: '100%',
  },
  image: {
    width: 40,
    height: 50,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  fileMenu: {
    marginRight: 5,
    height: 60,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 15,
  },
  fileDetailText: {
    fontSize: 10,
  },
});