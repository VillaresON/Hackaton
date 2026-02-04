// src/screens/StudentProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Dimensions } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { MaterialIcons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit'; // Gráfico

const screenWidth = Dimensions.get('window').width;

const StudentProfileScreen = ({ student, allAttendances }) => {
  
  // 1. Calcula Estatísticas
  const total = allAttendances.length;
  const presents = allAttendances.filter(a => a.present).length;
  const absences = total - presents;
  const percentage = total > 0 ? ((presents / total) * 100).toFixed(1) : 0;

  // 2. Dados para o Gráfico
  const chartData = [
    { name: 'Presenças', population: presents, color: '#4CAF50', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Faltas', population: absences, color: '#F44336', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  // 3. Função do WhatsApp
  const handleWhatsApp = () => {
    const message = `Olá! Sou professor(a) do *${student.name}*. Notei que ele faltou hoje. Gostaria de confirmar se está tudo bem?`;
    // Remove caracteres não numéricos do telefone
    const phone = student.parentPhone.replace(/\D/g, ''); 
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho do Aluno */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>{student.name.charAt(0)}</Text>
        </View>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentClass}>Frequência: {percentage}%</Text>
      </View>

      {/* Gráfico de Frequência */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Histórico de Presença</Text>
        {total > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        ) : (
          <Text style={{textAlign: 'center', padding: 20, color: '#999'}}>Sem dados suficientes ainda.</Text>
        )}
      </View>

      {/* Botão de WhatsApp */}
      <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
        <MaterialIcons name="chat" size={24} color="#fff" style={{marginRight: 10}} />
        <Text style={styles.whatsappText}>Contatar Responsável</Text>
      </TouchableOpacity>
      
      <Text style={styles.disclaimer}>
        Isso abrirá o WhatsApp com uma mensagem pré-definida para o número: {student.parentPhone}
      </Text>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6200ee', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarTextLarge: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  studentName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  studentClass: { fontSize: 16, color: '#666', marginTop: 5 },
  card: { backgroundColor: '#fff', margin: 15, padding: 15, borderRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  whatsappButton: {
    flexDirection: 'row', backgroundColor: '#25D366', margin: 20, padding: 15,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5
  },
  whatsappText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disclaimer: { textAlign: 'center', color: '#999', fontSize: 12, paddingHorizontal: 40, marginBottom: 20 }
});

// Busca TODAS as presenças desse aluno (Histórico)
const enhance = withObservables(['route'], ({ route }) => ({
  student: route.params.student,
  allAttendances: route.params.student.attendances.observe()
}));

export default enhance(StudentProfileScreen);