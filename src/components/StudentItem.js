// src/components/StudentItem.js
import React, { useState } from 'react'; // Importamos useState
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { toggleAttendance, removeAttendanceRecord } from '../services/AttendanceService';
import ConfirmModal from './ConfirmModal'; // Importamos nosso novo modal

const StudentItem = ({ student, attendances, onOpenProfile }) => {
  const attendance = attendances[0];
  const [isModalVisible, setModalVisible] = useState(false);

  const getStatusColor = () => {
    if (!attendance) return '#bdbdbd';
    return attendance.present ? '#4CAF50' : '#F44336';
  };

  const handlePress = () => {
    // Se já está presente (Verde), abrimos o modal
    if (attendance && attendance.present) {
      setModalVisible(true);
    } else {
      toggleAttendance(student);
    }
  };

  const confirmRemoval = () => {
    removeAttendanceRecord(attendance);
    setModalVisible(false); // Fecha o modal após remover
  };

  return (
    <>
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.mainAction} 
          onPress={handlePress}
          activeOpacity={0.7}
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

        <TouchableOpacity 
          style={styles.detailsButton} 
          onPress={onOpenProfile}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <MaterialIcons name="info-outline" size={28} color="#6200ee" />
        </TouchableOpacity>
      </View>

      {/* MODAL PROFISSIONAL AQUI */}
      <ConfirmModal
        isVisible={isModalVisible}
        title="Remover Presença?"
        message={`Deseja retirar a presença de ${student.name}? O status voltará para "Não marcado".`}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmRemoval}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 12, marginHorizontal: 15, marginTop: 10, borderRadius: 8, elevation: 2,
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
  detailsButton: { 
    padding: 10, borderLeftWidth: 1, borderLeftColor: '#f0f0f0', marginLeft: 5 
  }
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