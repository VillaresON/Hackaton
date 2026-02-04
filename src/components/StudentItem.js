// src/components/StudentItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { toggleAttendance } from '../services/AttendanceService';

// Note que agora recebemos 'attendances' (uma lista) em vez de 'attendance'
const StudentItem = ({ student, attendances }) => {
  
  // Pegamos o primeiro item da lista (já que filtramos por data, só deve ter 1 ou 0)
  const attendance = attendances[0];

  const getStatusColor = () => {
    if (!attendance) return '#ccc'; // Cinza (Neutro)
    return attendance.present ? '#4CAF50' : '#F44336'; // Verde ou Vermelho
  };

  return (
    <TouchableOpacity onPress={() => toggleAttendance(student)}>
      <View style={styles.itemContainer}>
        <View style={[styles.avatar, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.avatarText}>
            {student.name.charAt(0)}
          </Text>
        </View>
        <View>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.subtext}>
            {attendance 
              ? (attendance.present ? 'Presente' : 'Faltou') 
              : 'Toque para marcar'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtext: {
    fontSize: 12,
    color: '#888',
  }
});

const enhance = withObservables(['student'], ({ student }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    student,
    // CORREÇÃO: Removemos o .map().
    // O observe() retorna um array vivo. Se a chamada for criada, o array muda de [] para [attendance].
    attendances: database.get('attendances').query(
      Q.where('student_id', student.id),
      Q.where('date', today.getTime())
    ).observe() 
  };
});

export default enhance(StudentItem);