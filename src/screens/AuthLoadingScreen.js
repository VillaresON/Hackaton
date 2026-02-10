// src/screens/AuthLoadingScreen.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthLoadingScreen = ({ navigation }) => {
    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const userProfile = await AsyncStorage.getItem('user_profile');
            if (userProfile) {
                // Já tem cadastro -> Vai pra Home
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            } else {
                // Não tem cadastro -> Vai pra Welcome
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Welcome' }],
                });
            }
        } catch (e) {
            // Erro? Manda pra Welcome por segurança
            navigation.navigate('Welcome');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6200ee' }}>
            <ActivityIndicator size="large" color="#fff" />
        </View>
    );
};

export default AuthLoadingScreen;