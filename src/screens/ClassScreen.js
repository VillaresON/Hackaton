// src/screens/ClassScreen.js
import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import StudentItem from '../components/StudentItem';

// 'navigation' vem automaticamente porque ClassScreen é uma tela do Stack
const ClassScreen = ({ students, navigation }) => {
  
  const handleOpenProfile = (student) => {
    // Navega para a tela 'StudentProfile' passando o objeto 'student'
    navigation.navigate('StudentProfile', { student });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <StudentItem 
            student={item} 
            // Passamos a função aqui. Se isso falhar, o botão info não faz nada.
            onOpenProfile={() => handleOpenProfile(item)} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' }
});

const enhance = withObservables(['route'], ({ route }) => ({
  students: database.get('students').query(
    Q.where('class_id', route.params.classId)
  ),
}));

export default enhance(ClassScreen);