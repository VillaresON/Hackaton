// src/screens/ClassScreen.js
import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import StudentItem from '../components/StudentItem';

const ClassScreen = ({ students, navigation }) => {

    // Função para ir ao perfil quando clicar no botão de "Info"
    const handleOpenProfile = (student) => {
        navigation.navigate('StudentProfile', { student });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.infoText}>
                    Toque no aluno para mudar a presença.
                    Toque no ícone (ℹ️) para ver histórico e contactar pais.
                </Text>
            </View>

            <FlatList
                data={students}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <StudentItem
                        student={item}
                        onOpenProfile={() => handleOpenProfile(item)}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 15, backgroundColor: '#e8eaf6' },
    infoText: { color: '#5c6bc0', fontSize: 13, textAlign: 'center' }
});

// Busca apenas alunos que pertencem a esta turma (class_id)
const enhance = withObservables(['route'], ({ route }) => ({
    students: database.get('students').query(
        Q.where('class_id', route.params.classId)
    ),
}));

export default enhance(ClassScreen);