// src/screens/AdminScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import Modal from 'react-native-modal'; // Usando o modal profissional
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '../database';
import { generateClassReport } from '../services/ReportService';

const AdminScreen = () => {
  const [tab, setTab] = useState('class');
  
  // States Formulário
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('');
  
  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  
  // States para o Seletor de Turmas (Modal)
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState(''); // Para mostrar no input
  const [isClassModalVisible, setClassModalVisible] = useState(false);
  
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const all = await database.get('classes').query().fetch();
    setClasses(all);
    // Não selecionamos automático para forçar o usuário a escolher
  };

  // AÇÃO: Criar Turma
  const handleCreateClass = async () => {
    if (!className || !classGrade) return Alert.alert("Erro", "Preencha todos os campos");
    
    await database.write(async () => {
      await database.get('classes').create(c => {
        c.name = className;
        c.grade = classGrade;
      });
    });
    
    Alert.alert("Sucesso", "Turma criada!");
    setClassName(''); setClassGrade('');
    loadClasses();
  };

  // AÇÃO: Matricular Aluno
  const handleCreateStudent = async () => {
    if (!studentName || !selectedClassId) return Alert.alert("Erro", "Nome e Turma são obrigatórios");
    
    const classObj = await database.get('classes').find(selectedClassId);

    await database.write(async () => {
      await database.get('students').create(s => {
        s.name = studentName;
        s.parentPhone = parentPhone || 'Sem telefone';
        s.class.set(classObj);
      });
    });

    Alert.alert("Sucesso", "Aluno matriculado!");
    setStudentName(''); setParentPhone('');
  };

  // Função para selecionar turma no Modal
  const handleSelectClass = (cls) => {
    setSelectedClassId(cls.id);
    setSelectedClassName(`${cls.name} - ${cls.grade}`);
    setClassModalVisible(false);
  };

  // Componente de Aba
  const TabButton = ({ id, icon, label }) => (
    <TouchableOpacity onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.activeTab]}>
      <MaterialIcons name={icon} size={24} color={tab === id ? "#6200ee" : "#888"} />
      <Text style={[styles.tabText, tab === id && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TabButton id="class" icon="domain" label="Turmas" />
        <TabButton id="student" icon="person-add" label="Alunos" />
        <TabButton id="reports" icon="picture-as-pdf" label="Relatórios" />
      </View>

      <ScrollView style={styles.content}>
        
        {/* ABA 1: NOVA TURMA */}
        {tab === 'class' && (
          <View>
            <Text style={styles.headerTitle}>Criar Nova Turma</Text>
            
            <Text style={styles.label}>Nome da Disciplina</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="class" size={20} color="#666" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Ex: Matemática" value={className} onChangeText={setClassName} />
            </View>
            
            <Text style={styles.label}>Série/Ano</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="grade" size={20} color="#666" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Ex: 3º Ano B" value={classGrade} onChangeText={setClassGrade} />
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleCreateClass}>
              <MaterialIcons name="check-circle" size={24} color="#fff" style={{marginRight: 10}} />
              <Text style={styles.buttonText}>Salvar Turma</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ABA 2: NOVO ALUNO */}
        {tab === 'student' && (
          <View>
            <Text style={styles.headerTitle}>Matricular Aluno</Text>

            <Text style={styles.label}>Turma</Text>
            {/* CAMPO DE SELEÇÃO FAKE (ABRE O MODAL) */}
            <TouchableOpacity onPress={() => setClassModalVisible(true)}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="domain" size={20} color="#666" style={styles.inputIcon} />
                <Text style={[styles.input, { marginTop: 12, color: selectedClassName ? '#333' : '#aaa' }]}>
                  {selectedClassName || "Toque para selecionar a turma..."}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#666" style={{marginRight: 10}} />
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>Nome do Aluno</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Nome Completo" value={studentName} onChangeText={setStudentName} />
            </View>

            <Text style={styles.label}>WhatsApp do Responsável</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="smartphone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="5511999999999" keyboardType="phone-pad" value={parentPhone} onChangeText={setParentPhone} />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCreateStudent}>
              <MaterialIcons name="person-add" size={24} color="#fff" style={{marginRight: 10}} />
              <Text style={styles.buttonText}>Matricular</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ABA 3: RELATÓRIOS PDF */}
        {tab === 'reports' && (
          <View>
            <Text style={styles.headerTitle}>Central de Relatórios</Text>
            <Text style={styles.infoText}>Toque para gerar e imprimir a lista de presença.</Text>
            {classes.map(c => (
              <TouchableOpacity key={c.id} style={styles.reportCard} onPress={() => generateClassReport(c.id)}>
                <View style={styles.reportIconContainer}>
                  <MaterialIcons name="folder-shared" size={28} color="#6200ee" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.reportTitle}>{c.name}</Text>
                  <Text style={styles.reportSubtitle}>{c.grade}</Text>
                </View>
                <MaterialIcons name="print" size={24} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      {/* --- MODAL DE SELEÇÃO DE TURMA --- */}
      <Modal
        isVisible={isClassModalVisible}
        onBackdropPress={() => setClassModalVisible(false)}
        onBackButtonPress={() => setClassModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecione uma Turma</Text>
            <TouchableOpacity onPress={() => setClassModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={classes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectClass(item)}>
                <View style={styles.modalIconContainer}>
                  <MaterialIcons name="class" size={24} color="#6200ee" />
                </View>
                <View>
                  <Text style={styles.modalItemTitle}>{item.name}</Text>
                  <Text style={styles.modalItemSubtitle}>{item.grade}</Text>
                </View>
                {selectedClassId === item.id && (
                  <MaterialIcons name="check" size={24} color="#4CAF50" style={{marginLeft: 'auto'}} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{textAlign: 'center', padding: 20, color: '#999'}}>Nenhuma turma cadastrada.</Text>}
          />
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', elevation: 4, paddingVertical: 5 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#6200ee' },
  tabText: { fontSize: 12, marginTop: 4, color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#6200ee' },
  content: { padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 5, marginTop: 10, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 5, height: 50 },
  inputIcon: { marginLeft: 10, marginRight: 5 },
  input: { flex: 1, padding: 10, color: '#333', fontSize: 16 },
  button: { flexDirection: 'row', backgroundColor: '#6200ee', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 25, elevation: 3 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  infoText: { color: '#666', marginBottom: 15 },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  reportIconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f3e5f5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  reportTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  reportSubtitle: { color: '#666' },

  // Estilos do Modal
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ede7f6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  modalItemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  modalItemSubtitle: { fontSize: 14, color: '#888' }
});

export default AdminScreen;