import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ClassScreen from '../screens/ClassScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import AdminScreen from '../screens/AdminScreen';

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
                <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'Perfil do Aluno' }} />
                <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Gestão Escolar' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}