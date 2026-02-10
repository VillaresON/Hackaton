// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Telas
import HomeScreen from '../screens/HomeScreen';
import ClassScreen from '../screens/ClassScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import GradesScreen from '../screens/GradesScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import CalendarScreen from '../screens/CalendarScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="AuthLoading" // <--- O App começa aqui agora
                screenOptions={{
                    headerStyle: { backgroundColor: '#6200ee' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                {/* Telas de Fluxo Inicial (Sem Header) */}
                <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />

                {/* Telas Principais */}
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'EduFlow' }} />
                <Stack.Screen name="ClassDetails" component={ClassScreen} options={({ route }) => ({ title: route.params.className })} />
                <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'Perfil do Aluno' }} />
                <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Gestão Escolar' }} />
                <Stack.Screen name="Grades" component={GradesScreen} options={{ title: 'Diário de Notas' }} />
                <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Agendamento Escolar' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}