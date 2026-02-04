import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ClassScreen from '../screens/ClassScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#6200ee' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Painel do Professor' }} 
        />
        <Stack.Screen 
          name="ClassDetails" 
          component={ClassScreen} 
          options={({ route }) => ({ title: route.params.className })} 
        />
        <Stack.Screen 
          name="StudentProfile" 
          component={StudentProfileScreen} 
          options={{ title: 'Perfil do Aluno' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}