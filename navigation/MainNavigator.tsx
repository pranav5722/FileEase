import React from 'react';

import { Ionicons } from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeStackNavigator from './HomeStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import Web from '../screens/Cloud';
import FileTransfer from '../screens/FileTransfer';
import Secure from '../screens/Secure';
import { useAppSelector } from '../hooks/reduxHooks';
import SecureFolder from '../screens/Secure';

const Tab = createBottomTabNavigator();

export const MainNavigator: React.FC = () => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { visible } = useAppSelector((state) => state.tabbarStyle);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          display: visible ? 'flex' : 'none',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') {
            iconName = focused ? 'ios-home' : 'ios-home';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'ios-list' : 'ios-list';
          } else if (route.name === 'Downloads') {
            iconName = 'ios-cloud-download';
          } else if (route.name === 'Cloud') {
            iconName = 'cloud';
          } else if (route.name === 'FileTransfer') {
            iconName = 'ios-documents-outline';
          } else if (route.name === 'Secure') {
            iconName = 'lock-closed-outline'
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveBackgroundColor: colors.background,
        tabBarInactiveBackgroundColor: colors.background,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Cloud" component={Web} />
      <Tab.Screen name="FileTransfer" component={FileTransfer} />
      {/* <Tab.Screen name="Secure" component={SecureFolder} /> */}
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
};
