// src/screens/GradesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal'; // <--- O astro do show
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { saveGradesBatch, generateGradesReport, deleteGradesList } from '../services/GradeService';

const GradesScreen = ({ route, navigation }) => {
  const { classId, className } = route.params;
  
  const [activeTab, setActiveTab] = useState('launch');
  const [students, setStudents] = useState([]);
  const [description, setDescription] = useState('');
  const [gradesMap, setGradesMap] = useState({});
  const [historyList, setHistoryList] = useState([]);

  // --- STATE DO MODAL PROFISSIONAL ---
  const [modal, setModal] = useState({
    isVisible: false,
    type: 'info', // 'success', 'error', 'confirm', 'info'
    title: '',
    message: '',
    onConfirm: null, // Ação ao clicar em "Sim" ou "OK"
  });

  useEffect(() => {
    loadStudentsAndHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab]);

  // --- FUNÇÕES AUXILIARES DO MODAL ---
  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ isVisible: true, type, title, message, onConfirm });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isVisible: false }));
  };

  const handleConfirmAction = () => {
    if (modal.onConfirm) modal.onConfirm();
    closeModal();
  };
  // -----------------------------------

  const loadStudentsAndHistory = async () => {
    const list = await database.get('students').query(Q.where('class_id', classId)).fetch();
    setStudents(list);
    
    const initialMap = {};
    list.forEach(s => initialMap[s.id] = '');
    setGradesMap(initialMap);

    loadHistory(list);
  };

  const loadHistory = async (studentList = students) => {
    if (studentList.length === 0) return;
    const studentIds = studentList.map(s => s.id);
    const allGrades = await database.get('grades').query(
      Q.where('student_id', Q.oneOf(studentIds))
    ).fetch();

    const groups = {};
    allGrades.forEach(g => {
      const dateStr = new Date(g.date).toLocaleDateString('pt-BR');
      const key = `${g.description}|${g.date}`;
      if (!groups[key]) {
        groups[key] = {
          description: g.description,
          dateTimestamp: g.date,
          dateLabel: dateStr,
          count: 0,
          grades: []
        };
      }
      groups[key].count++;
      groups[key].grades.push(g);
    });

    const history = Object.values(groups).sort((a, b) => b.dateTimestamp - a.dateTimestamp);
    setHistoryList(history);
  };

  const handleGradeChange = (studentId, text) => {
    setGradesMap(prev => ({ ...prev, [studentId]: text }));
  };

  // --- SALVAR (Com Modal) ---
  const handleSave = async () => {
    if (!description.trim()) {
      return showModal('info', 'Nome Obrigatório', 'Por favor, dê um nome para esta avaliação (Ex: Prova 1).');
    }

    const dataToSave = Object.keys(gradesMap).map(studentId => ({
      studentId,
      score: gradesMap[studentId]
    }));

    if (!dataToSave.some(d => d.score !== '')) {
      return showModal('info', 'Tudo Vazio?', 'Lance a nota de pelo menos um aluno antes de salvar.');
    }

    try {
      await saveGradesBatch(dataToSave, description);
      
      // Modal de Sucesso com Ação
      showModal('success', 'Salvo com Sucesso!', 'As notas foram registradas no sistema.', () => {
        setDescription('');
        const cleanMap = {};
        students.forEach(s => cleanMap[s.id] = '');
        setGradesMap(cleanMap);
        setActiveTab('history');
      });

    } catch (e) {
      showModal('error', 'Erro ao Salvar', 'Ocorreu uma falha no banco de dados. Tente novamente.');
    }
  };

  // --- IMPRIMIR ---
  const handlePrintHistory = async (item) => {
    const dataForReport = students.map(student => {
      const gradeRecord = item.grades.find(g => g.student.id === student.id);
      return {
        name: student.name,
        score: gradeRecord ? String(gradeRecord.value) : '-'
      };
    });

    await generateGradesReport(classId, item.description, dataForReport);
  };

  // --- DELETAR (Com Modal de Confirmação) ---
  const handleDeleteHistory = (item) => {
    showModal(
      'confirm', 
      'Excluir Lançamento?', 
      `Tem certeza que deseja apagar todas as notas de "${item.description}"? Essa ação não pode ser desfeita.`,
      async () => {
        try {
          await deleteGradesList(item.grades);
          // Pequeno delay para dar tempo do banco processar antes de recarregar
          setTimeout(() => {
             loadHistory();
             // Feedback sutil ou modal de sucesso rápido
          }, 200);
        } catch (e) {
          showModal('error', 'Erro', 'Não foi possível excluir os registros.');
        }
      }
    );
  };

  // --- COMPONENTES VISUAIS ---
  const TabButton = ({ id, icon, label }) => (
    <TouchableOpacity onPress={() => setActiveTab(id)} style={[styles.tab, activeTab === id && styles.activeTab]}>
      <MaterialIcons name={icon} size={24} color={activeTab === id ? "#6200ee" : "#888"} />
      <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  // Helper para ícones e cores do Modal
  const getModalStyle = () => {
    switch(modal.type) {
      case 'success': return { icon: 'check-circle', color: '#4CAF50', btnText: 'OK, Maravilha' };
      case 'error': return { icon: 'error', color: '#F44336', btnText: 'Fechar' };
      case 'confirm': return { icon: 'warning', color: '#FF9800', btnText: 'Sim, Excluir' };
      default: return { icon: 'info', color: '#6200ee', btnText: 'Entendi' };
    }
  };
  const modalStyle = getModalStyle();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>{className}</Text>
        <Text style={styles.subtitle}>Gestão de Notas</Text>
      </View>

      <View style={styles.tabBar}>
        <TabButton id="launch" icon="edit" label="Lançar Notas" />
        <TabButton id="history" icon="history" label="Histórico Salvo" />
      </View>

      <View style={styles.content}>
        {activeTab === 'launch' && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome da Avaliação:</Text>
              <TextInput 
                style={styles.descInput} 
                placeholder="Ex: Prova 1º Bimestre" 
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <FlatList
              data={students}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 80 }}
              renderItem={({ item }) => (
                <View style={styles.studentRow}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <TextInput 
                    style={styles.gradeInput}
                    placeholder="-"
                    keyboardType="numeric"
                    maxLength={4}
                    value={gradesMap[item.id]}
                    onChangeText={(text) => handleGradeChange(item.id, text)}
                  />
                </View>
              )}
            />

            <TouchableOpacity style={styles.fabSave} onPress={handleSave}>
              <MaterialIcons name="save" size={28} color="#fff" />
              <Text style={styles.fabText}>SALVAR</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'history' && (
          <FlatList
            data={historyList}
            keyExtractor={(item) => item.description + item.dateTimestamp}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="playlist-add" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma avaliação lançada ainda.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{item.description}</Text>
                  <Text style={styles.historyDate}>{item.dateLabel} • {item.count} alunos avaliados</Text>
                </View>
                
                <View style={styles.historyActions}>
                  <TouchableOpacity onPress={() => handlePrintHistory(item)} style={styles.actionButton}>
                    <MaterialIcons name="print" size={24} color="#6200ee" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => handleDeleteHistory(item)} style={styles.actionButton}>
                    <MaterialIcons name="delete-outline" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* --- O MODAL PROFISSIONAL --- */}
      <Modal
        isVisible={modal.isVisible}
        onBackdropPress={modal.type === 'confirm' ? closeModal : null} // Obriga a escolher se for confirm
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
        backdropOpacity={0.5}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalIconBox, { backgroundColor: modalStyle.color + '20' }]}>
            <MaterialIcons name={modalStyle.icon} size={40} color={modalStyle.color} />
          </View>

          <Text style={styles.modalTitle}>{modal.title}</Text>
          <Text style={styles.modalMessage}>{modal.message}</Text>

          <View style={styles.modalButtons}>
            {modal.type === 'confirm' && (
              <TouchableOpacity style={styles.modalCancelBtn} onPress={closeModal}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.modalConfirmBtn, { backgroundColor: modalStyle.color }]} 
              onPress={handleConfirmAction}
            >
              <Text style={styles.modalConfirmText}>{modalStyle.btnText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666' },

  tabBar: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2, marginBottom: 5 },
  tab: { flex: 1, padding: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#6200ee' },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#888' },
  activeTabText: { color: '#6200ee' },

  content: { flex: 1 },

  inputContainer: { padding: 15, backgroundColor: '#fff', margin: 10, borderRadius: 8, elevation: 1 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 },
  descInput: { borderBottomWidth: 1, borderColor: '#6200ee', fontSize: 16, paddingVertical: 5, color: '#333' },

  studentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginHorizontal: 10, marginTop: 5, borderRadius: 8, elevation: 1 },
  studentName: { fontSize: 16, color: '#333', flex: 1 },
  gradeInput: { width: 60, height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 4, textAlign: 'center', fontSize: 16, backgroundColor: '#f9f9f9', color: '#333' },

  fabSave: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#6200ee', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, elevation: 5 },
  fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },

  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginHorizontal: 10, marginTop: 10, borderRadius: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#6200ee' },
  historyInfo: { flex: 1 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  historyDate: { fontSize: 12, color: '#666', marginTop: 4 },
  historyActions: { flexDirection: 'row' },
  actionButton: { padding: 8, marginLeft: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 },

  // --- ESTILOS DO MODAL ---
  modalContainer: { backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center' },
  modalIconBox: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'center' },
  modalCancelBtn: { flex: 1, padding: 12, marginRight: 10, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center' },
  modalConfirmBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', elevation: 2 },
  modalCancelText: { color: '#666', fontWeight: 'bold', fontSize: 16 },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default GradesScreen;