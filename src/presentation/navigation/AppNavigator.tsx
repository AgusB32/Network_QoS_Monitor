import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

import { DashboardScreen } from '../screens/DashboardScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { MapScreen } from '../screens/MapScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Margen inferior dinámico que respeta el Home Indicator de iPhone y la barra de navegación de Android
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);
  const tabBarHeight = 58 + bottomInset;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              height: tabBarHeight,
              paddingBottom: bottomInset,
            },
          ],
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'speedometer' : 'speedometer-outline'}
                size={size ?? 23}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Resultados"
          component={ResultsScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={size ?? 23}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Mapa"
          component={MapScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'map' : 'map-outline'}
                size={size ?? 23}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Historial"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={size ?? 23}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  tabLabel: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
