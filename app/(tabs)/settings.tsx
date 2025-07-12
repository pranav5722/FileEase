import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import colors from '../../constants/colors';
import { ChevronRight, Fingerprint, Lock, Moon, Shield } from 'lucide-react-native';
import PinModal from '../../components/PinModal';

export default function SettingsScreen() {
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showVerifyPinModal, setShowVerifyPinModal] = useState(false);
  
  const { 
    darkMode, 
    toggleDarkMode, 
    appLockEnabled, 
    toggleAppLock,
    useBiometrics,
    toggleBiometrics,
    pin,
    setPin,
    clearPin
  } = useSettingsStore();
  
  const theme = darkMode ? colors.dark : colors.light;
  
  const checkBiometricSupport = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Biometric authentication is not available on web');
      return false;
    }
    
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('Not Compatible', 'Your device does not support biometric authentication');
      return false;
    }
    
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert('Not Enrolled', 'Please set up biometric authentication in your device settings');
      return false;
    }
    
    return true;
  };
  
  const handleToggleBiometrics = async () => {
    if (useBiometrics) {
      toggleBiometrics();
      return;
    }
    
    const supported = await checkBiometricSupport();
    if (supported) {
      toggleBiometrics();
    }
  };
  
  const handleSetPin = () => {
    setShowSetPinModal(true);
  };
  
  const handleChangePin = () => {
    if (pin) {
      setShowVerifyPinModal(true);
    } else {
      setShowSetPinModal(true);
    }
  };
  
  const handleVerifyPinSuccess = () => {
    setShowVerifyPinModal(false);
    setShowChangePinModal(true);
  };
  
  const handleRemovePin = () => {
    if (pin) {
      Alert.alert(
        'Remove PIN',
        'Are you sure you want to remove your PIN? This will disable secure access.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => {
              clearPin();
              if (useBiometrics) {
                toggleBiometrics();
              }
              if (appLockEnabled) {
                toggleAppLock();
              }
              Alert.alert('PIN Removed', 'Your PIN has been removed successfully');
            }
          },
        ]
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Moon size={22} color={theme.primary} style={styles.settingIcon} />
              <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
            </View>
            
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#767577', true: theme.primary + '80' }}
              thumbColor={darkMode ? theme.primary : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Security</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={handleSetPin}
          >
            <View style={styles.settingInfo}>
              <Lock size={22} color={theme.primary} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingText, { color: theme.text }]}>Set PIN</Text>
                <Text style={[styles.settingDescription, { color: theme.subtext }]}>
                  {pin ? 'PIN is set' : 'Protect your files with a PIN'}
                </Text>
              </View>
            </View>
            
            <ChevronRight size={20} color={theme.subtext} />
          </TouchableOpacity>
          
          {pin && (
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: theme.border }]}
              onPress={handleChangePin}
            >
              <View style={styles.settingInfo}>
                <Lock size={22} color={theme.primary} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: theme.text }]}>Change PIN</Text>
              </View>
              
              <ChevronRight size={20} color={theme.subtext} />
            </TouchableOpacity>
          )}
          
          {Platform.OS !== 'web' && (
            <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Fingerprint size={22} color={theme.primary} style={styles.settingIcon} />
                <View>
                  <Text style={[styles.settingText, { color: theme.text }]}>Biometric Authentication</Text>
                  <Text style={[styles.settingDescription, { color: theme.subtext }]}>
                    Use fingerprint or face recognition
                  </Text>
                </View>
              </View>
              
              <Switch
                value={useBiometrics}
                onValueChange={handleToggleBiometrics}
                trackColor={{ false: '#767577', true: theme.primary + '80' }}
                thumbColor={useBiometrics ? theme.primary : '#f4f3f4'}
                disabled={!pin}
              />
            </View>
          )}
          
          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Shield size={22} color={theme.primary} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingText, { color: theme.text }]}>App Lock</Text>
                <Text style={[styles.settingDescription, { color: theme.subtext }]}>
                  Require authentication when opening the app
                </Text>
              </View>
            </View>
            
            <Switch
              value={appLockEnabled}
              onValueChange={toggleAppLock}
              trackColor={{ false: '#767577', true: theme.primary + '80' }}
              thumbColor={appLockEnabled ? theme.primary : '#f4f3f4'}
              disabled={!pin}
            />
          </View>
          
          {pin && (
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: theme.border }]}
              onPress={handleRemovePin}
            >
              <View style={styles.settingInfo}>
                <Lock size={22} color={theme.danger} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: theme.danger }]}>Remove PIN</Text>
              </View>
              
              <ChevronRight size={20} color={theme.subtext} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <Text style={[styles.settingText, { color: theme.text }]}>Version</Text>
            <Text style={[styles.versionText, { color: theme.subtext }]}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Modals */}
      <PinModal
        visible={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        onSuccess={() => {
          setShowSetPinModal(false);
          Alert.alert('PIN Set', 'Your PIN has been set successfully');
        }}
        isSetup={true}
      />
      
      <PinModal
        visible={showVerifyPinModal}
        onClose={() => setShowVerifyPinModal(false)}
        onSuccess={handleVerifyPinSuccess}
      />
      
      <PinModal
        visible={showChangePinModal}
        onClose={() => setShowChangePinModal(false)}
        onSuccess={() => {
          setShowChangePinModal(false);
          Alert.alert('PIN Changed', 'Your PIN has been changed successfully');
        }}
        isSetup={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 50, // Add extra padding at the top since we removed the header
  },
  title: {
    fontSize: 24,
    padding: 0,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  versionText: {
    fontSize: 14,
  },
});