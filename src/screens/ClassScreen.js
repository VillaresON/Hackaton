// src/screens/ClassScreen.js
import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { MaterialIcons } from '@expo/vector-icons'; // Importamos os ícones
import { database } from '../database';
import StudentItem from '../components/StudentItem';

const ClassScreen = ({ students, navigation }) => {
  
  const handleOpenProfile = (student) => {
    navigation.navigate('StudentProfile', { student });
  };

  return (
    <View style={styles.container}>
      
      {/* --- BARRA DE LEGENDA (NOVA) --- */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Instruções de Chamada:</Text>
        
        <View style={styles.legendRow}>
          {/* Instrução de Presença */}
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Toque: <Text style={{fontWeight: 'bold'}}>Presente</Text></Text>
          </View>

          {/* Instrução de Falta */}
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Segure: <Text style={{fontWeight: 'bold'}}>Falta</Text></Text>
          </View>
        </View>

        {/* Instrução do Perfil */}
        <View style={styles.legendRowSecondary}>
          <MaterialIcons name="info-outline" size={16} color="#6200ee" />
          <Text style={styles.legendSubText}> Clique no ícone (i) para ver detalhes</Text>
        </View>
      </View>
      {/* ------------------------------- */}

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
    elevation: 2, // Sombra leve
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
    justifyContent: 'space-around', // Espalha os itens
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
  legendText: {
    fontSize: 13,
    color: '#333',
  },
  legendRowSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  legendSubText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  }
});

const enhance = withObservables(['route'], ({ route }) => ({
  students: database.get('students').query(
    Q.where('class_id', route.params.classId)
  ),
}));

export default enhance(ClassScreen);