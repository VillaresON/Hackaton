// src/screens/WelcomeScreen.js
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Dimensions, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Habilita animações no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    const [step, setStep] = useState(1); // 1 = Sexo, 2 = Nome
    const [gender, setGender] = useState(null); // 'M' ou 'F'
    const [name, setName] = useState('');

    // Passo 1: Selecionar Sexo
    const handleSelectGender = (selected) => {
        // Animação suave para a próxima tela
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setGender(selected);
        setStep(2);
    };

    // Passo 2: Salvar e Ir para Home
    const handleFinish = async () => {
        if (!name.trim()) {
            Alert.alert("Ops", "Por favor, digite seu nome.");
            return;
        }

        try {
            const userProfile = {
                name: name.trim(),
                gender: gender, // 'M' ou 'F'
                isSetup: true
            };

            // Salva no celular pra sempre
            await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));

            // Reseta a navegação e vai para a Home (impede voltar para cá)
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (e) {
            Alert.alert("Erro", "Não foi possível salvar seus dados.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>

                {/* Cabeçalho Atualizado */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        {/* Aqui você pode trocar o ícone por uma imagem sua depois */}
                        {/* <Image source={require('../../assets/icon.png')} style={{width: 60, height: 60}} /> */}
                        <MaterialIcons name="school" size={50} color="#6200ee" />
                    </View>

                    <Text style={styles.appName}>EduFlow</Text> {/* NOVO NOME */}
                    <Text style={styles.welcomeText}>Bem-vindo(a)!</Text>
                    <Text style={styles.subText}>Vamos configurar seu perfil de educador.</Text>
                </View>

                {/* --- PASSO 1: ESCOLHER SEXO --- */}
                {step === 1 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.questionText}>Como deseja ser chamado?</Text>

                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.card, gender === 'M' && styles.selectedCard]}
                                onPress={() => handleSelectGender('M')}
                            >
                                <MaterialIcons name="face" size={60} color={gender === 'M' ? "#fff" : "#6200ee"} />
                                <Text style={[styles.cardText, gender === 'M' && styles.selectedText]}>Professor</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.card, gender === 'F' && styles.selectedCard]}
                                onPress={() => handleSelectGender('F')}
                            >
                                <MaterialIcons name="face-3" size={60} color={gender === 'F' ? "#fff" : "#6200ee"} />
                                <Text style={[styles.cardText, gender === 'F' && styles.selectedText]}>Professora</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* --- PASSO 2: DIGITAR NOME --- */}
                {step === 2 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.questionText}>Qual é o seu nome?</Text>
                        <Text style={styles.hintText}>Isso aparecerá nos relatórios e na tela inicial.</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ex: João Silva"
                            placeholderTextColor="#ddd"
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />

                        <TouchableOpacity style={styles.button} onPress={handleFinish}>
                            <Text style={styles.buttonText}>Começar a Usar</Text>
                            <MaterialIcons name="arrow-forward" size={24} color="#6200ee" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 30 }}>
                            <Text style={{ color: '#fff9', textDecorationLine: 'underline' }}>Voltar e mudar sexo</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#6200ee' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

    header: { alignItems: 'center', marginBottom: 40 },
    logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 10 },
    welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
    subText: { fontSize: 16, color: '#e0e0e0', marginTop: 5, textAlign: 'center' },

    stepContainer: { width: '100%', alignItems: 'center' },
    questionText: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
    hintText: { fontSize: 14, color: '#e0e0e0', marginBottom: 20 },

    row: { flexDirection: 'row', gap: 20 },

    // Cards
    card: {
        width: width * 0.38, height: 160,
        backgroundColor: '#fff', borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        elevation: 5
    },
    selectedCard: { backgroundColor: '#3700b3', borderWidth: 2, borderColor: '#fff' }, // Roxo mais escuro quando selecionado
    cardText: { fontSize: 18, fontWeight: 'bold', color: '#6200ee', marginTop: 15 },
    selectedText: { color: '#fff' },

    // Input
    input: {
        width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 15, borderRadius: 12,
        fontSize: 20, color: '#fff', textAlign: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 20
    },

    button: {
        flexDirection: 'row', backgroundColor: '#fff',
        paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30,
        alignItems: 'center', elevation: 5, marginTop: 10
    },
    buttonText: { color: '#6200ee', fontWeight: 'bold', fontSize: 18, marginRight: 10 },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
        marginBottom: 5
    },

    welcomeText: { fontSize: 22, fontWeight: '600', color: '#e0e0e0', textAlign: 'center' },
});

export default WelcomeScreen;