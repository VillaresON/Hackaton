// src/screens/ClassScreen.js
import React from 'react';
// CORREÇÃO AQUI: Adicionei TouchableOpacity na lista de imports
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '../database';
import StudentItem from '../components/StudentItem';

const ClassScreen = ({ students, navigation, route }) => {

  const handleOpenProfile = (student) => {
    navigation.navigate('StudentProfile', { student });
  };

  const handleOpenGrades = () => {
    navigation.navigate('Grades', {
      classId: route.params.classId,
      className: route.params.className
    });
  };

  return (
    <View style={styles.container}>

      {/* --- BARRA DE LEGENDA --- */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Instruções de Chamada:</Text>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Toque: <Text style={{fontWeight: 'bold'}}>Presente</Text></Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Segure: <Text style={{fontWeight: 'bold'}}>Falta</Text></Text>
          </View>
        </View>

        <View style={styles.legendRowSecondary}>
          <MaterialIcons name="info-outline" size={16} color="#6200ee" />
          <Text style={styles.legendSubText}> Clique no ícone (i) para ver detalhes</Text>
        </View>
      </View>

      {/* --- BOTÕES DE AÇÕES (NOVOS) --- */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.gradeButton} onPress={handleOpenGrades}>
          <MaterialIcons name="assignment-turned-in" size={24} color="#fff" />
          <Text style={styles.gradeButtonText}>LANÇAR NOTAS</Text>
        </TouchableOpacity>
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

  // Estilos da Legenda
  legendContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    marginBottom: 5,
  },
  legendTitle: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: { fontSize: 13, color: '#333' },
  legendRowSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  legendSubText: { fontSize: 12, color: '#666', fontStyle: 'italic' },

  // Estilo do Botão de Notas
  gradeButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9800', // Laranja
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },
  gradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 14
  },

  // Container para botões de ações
  actionButtonsContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
  }
});

const enhance = withObservables(['route'], ({ route }) => ({
  students: database.get('students').query(
    Q.where('class_id', route.params.classId)
  ),
}));

export default enhance(ClassScreen);