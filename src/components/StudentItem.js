// src/components/StudentItem.js (Atualizado)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { toggleAttendance } from '../services/AttendanceService';

const StudentItem = ({ student, attendances, onOpenProfile }) => {
  const attendance = attendances[0];

  const getStatusColor = () => {
    if (!attendance) return '#bdbdbd'; // Cinza
    return attendance.present ? '#4CAF50' : '#F44336'; // Verde ou Vermelho
  };

  return (
    <View style={styles.card}>
      {/* Lado Esquerdo: Ação de Presença Rápida */}
      <TouchableOpacity 
        style={styles.mainAction} 
        onPress={() => toggleAttendance(student)}
      >
        <View style={[styles.avatar, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.status}>
            {attendance 
              ? (attendance.present ? 'Presente' : 'Faltou') 
              : 'Toque para marcar'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Lado Direito: Botão para Perfil/WhatsApp */}
      <TouchableOpacity style={styles.detailsButton} onPress={onOpenProfile}>
        <MaterialIcons name="info-outline" size={24} color="#6200ee" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    elevation: 2, // Sombra no Android
  },
  mainAction: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 45, height: 45, borderRadius: 22.5,
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  status: { fontSize: 12, color: '#666' },
  detailsButton: { padding: 10, borderLeftWidth: 1, borderLeftColor: '#eee' }
});

const enhance = withObservables(['student'], ({ student }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    student,
    attendances: database.get('attendances').query(
      Q.where('student_id', student.id),
      Q.where('date', today.getTime())
    ).observe()
  };
});

export default enhance(StudentItem);