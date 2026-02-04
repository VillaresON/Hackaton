// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// CONFIRA SE OS ARQUIVOS EXISTEM NESSAS PASTAS
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
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Painel' }} />
        <Stack.Screen name="ClassDetails" component={ClassScreen} options={{ title: 'Turma' }} />
        {/* O NOME AQUI PRECISA SER 'StudentProfile' POIS USAMOS NO NAVIGATE */}
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'Perfil do Aluno' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}