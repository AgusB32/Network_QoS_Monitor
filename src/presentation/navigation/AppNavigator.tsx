import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

import { DashboardScreen } from '../screens/DashboardScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { MapScreen } from '../screens/MapScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

// Componente simple de icono basado en texto/glifo estilizado
const TabIcon: React.FC<{ label: string; focused: boolean }> = ({ label, focused }) => {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
        {label}
      </Text>
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="Inicio"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="⚡" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Resultados"
          component={ResultsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="📊" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Mapa"
          component={MapScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="🗺️" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Historial"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="📁" focused={focused} />,
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
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontWeight: '700',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    opacity: 0.6,
  },
  iconTextFocused: {
    opacity: 1,
  },
});
