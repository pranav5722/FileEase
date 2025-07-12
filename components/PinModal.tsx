import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import colors from '../constants/colors';

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isSetup?: boolean;
  confirmPin?: boolean;
}

const PinModal: React.FC<PinModalProps> = ({
  visible,
  onClose,
  onSuccess,
  isSetup = false,
  confirmPin = false,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPinValue, setConfirmPinValue] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  
  const { pin: storedPin, setPin: storePin } = useSettingsStore();
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  useEffect(() => {
    if (visible) {
      setPin('');
      setConfirmPinValue('');
      setError('');
      setStep('enter');
    }
  }, [visible]);
  
  const handlePinDigit = (digit: string) => {
    if (step === 'enter') {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        
        if (newPin.length === 4) {
          if (isSetup) {
            setStep('confirm');
          } else {
            validatePin(newPin);
          }
        }
      }
    } else {
      if (confirmPinValue.length < 4) {
        const newConfirmPin = confirmPinValue + digit;
        setConfirmPinValue(newConfirmPin);
        
        if (newConfirmPin.length === 4) {
          if (newConfirmPin === pin) {
            storePin(pin);
            onSuccess();
            onClose();
          } else {
            setError('PINs do not match. Try again.');
            setConfirmPinValue('');
          }
        }
      }
    }
  };
  
  const handleBackspace = () => {
    if (step === 'enter') {
      if (pin.length > 0) {
        setPin(pin.slice(0, -1));
      }
    } else {
      if (confirmPinValue.length > 0) {
        setConfirmPinValue(confirmPinValue.slice(0, -1));
      }
    }
  };
  
  const validatePin = (enteredPin: string) => {
    if (confirmPin && storedPin) {
      if (enteredPin === storedPin) {
        onSuccess();
        onClose();
      } else {
        setError('Incorrect PIN. Try again.');
        setPin('');
      }
    } else if (storedPin) {
      if (enteredPin === storedPin) {
        onSuccess();
        onClose();
      } else {
        setError('Incorrect PIN. Try again.');
        setPin('');
      }
    }
  };
  
  const renderPinDots = () => {
    const currentPin = step === 'enter' ? pin : confirmPinValue;
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { borderColor: theme.primary },
              i < currentPin.length && { backgroundColor: theme.primary }
            ]}
          />
        ))}
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            {isSetup 
              ? (step === 'enter' ? 'Set PIN' : 'Confirm PIN') 
              : 'Enter PIN'}
          </Text>
          
          {renderPinDots()}
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              {isSetup 
                ? (step === 'enter' ? 'Create a 4-digit PIN' : 'Re-enter your PIN to confirm') 
                : 'Enter your 4-digit PIN'}
            </Text>
          )}
          
          <View style={styles.keypadContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.keypadButton, { borderColor: theme.border }]}
                onPress={() => handlePinDigit(num.toString())}
              >
                <Text style={[styles.keypadText, { color: theme.text }]}>{num}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.keypadButton} />
            
            <TouchableOpacity
              style={[styles.keypadButton, { borderColor: theme.border }]}
              onPress={() => handlePinDigit('0')}
            >
              <Text style={[styles.keypadText, { color: theme.text }]}>0</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.keypadButton, { borderColor: theme.border }]}
              onPress={handleBackspace}
            >
              <Text style={[styles.keypadText, { color: theme.text }]}>⌫</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  keypadButton: {
    width: '30%',
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '500',
  },
  cancelButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PinModal;