import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider } from './src/context/AppContext';
import DashboardScreen from './src/screens/DashboardScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import AddEditAccountScreen from './src/screens/AddEditAccountScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ChartsScreen from './src/screens/ChartsScreen';

const Tab = createBottomTabNavigator();
const AccountsStack = createStackNavigator();

function AccountsStackNavigator() {
  return (
    <AccountsStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountsStack.Screen name="AccountsList" component={AccountsScreen} />
      <AccountsStack.Screen name="AddEditAccount" component={AddEditAccountScreen} />
    </AccountsStack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopColor: '#EEEEEE',
                paddingBottom: 6,
                paddingTop: 6,
                height: 64,
              },
              tabBarActiveTintColor: '#1B5E20',
              tabBarInactiveTintColor: '#9E9E9E',
              tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
              tabBarIcon: ({ focused, color, size }) => {
                const icons = {
                  Dashboard: focused ? 'home' : 'home-outline',
                  Accounts: focused ? 'wallet' : 'wallet-outline',
                  History: focused ? 'time' : 'time-outline',
                  Charts: focused ? 'bar-chart' : 'bar-chart-outline',
                };
                return <Ionicons name={icons[route.name]} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Accounts" component={AccountsStackNavigator} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Charts" component={ChartsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppProvider>
  );
}
