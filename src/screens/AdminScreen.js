// src/screens/AdminScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import { generateClassReport } from '../services/ReportService';

// ==============================================================================
// SUB-COMPONENTES REATIVOS (A Magica do WatermelonDB acontece aqui)
// Eles se atualizam sozinhos quando o banco de dados muda!
// ==============================================================================

// 1. Lista de Turmas Reativa
const ReactiveClassList = ({ classes, onDelete }) => (
  <View>
    {classes.map(item => (
      <View key={item.id} style={styles.listItem}>
        <View>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.grade}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.deleteButton}>
          <MaterialIcons name="delete-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    ))}
    {classes.length === 0 && <Text style={styles.emptyText}>Nenhuma turma cadastrada.</Text>}
  </View>
);

// Conecta o componente ao banco
const EnhancedClassList = withObservables([], () => ({
  classes: database.get('classes').query()
}))(ReactiveClassList);


// 2. Lista de Alunos Reativa (Filtra pelo ID da turma)
const ReactiveStudentList = ({ students, onDelete, className }) => (
  <View>
    <Text style={styles.sectionHeader}>Alunos em {className}</Text>
    {students.map(item => (
      <View key={item.id} style={styles.listItem}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.deleteButton}>
          <MaterialIcons name="delete-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    ))}
    {students.length === 0 && <Text style={styles.emptyText}>Nenhum aluno nesta turma.</Text>}
  </View>
);

// Conecta ao banco usando a prop 'classId' que vem do pai
const EnhancedStudentList = withObservables(['classId'], ({ classId }) => ({
  students: database.get('students').query(Q.where('class_id', classId))
}))(ReactiveStudentList);


// 3. Lista do Modal de Seleção Reativa
const ReactiveModalList = ({ classes, onSelect, selectedId }) => (
  <FlatList
    data={classes}
    keyExtractor={item => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
        <View style={styles.modalIconContainer}>
          <MaterialIcons name="class" size={24} color="#6200ee" />
        </View>
        <View>
          <Text style={styles.modalItemTitle}>{item.name}</Text>
          <Text style={styles.modalItemSubtitle}>{item.grade}</Text>
        </View>
        {selectedId === item.id && (
          <MaterialIcons name="check" size={24} color="#4CAF50" style={{marginLeft: 'auto'}} />
        )}
      </TouchableOpacity>
    )}
    ListEmptyComponent={<Text style={{textAlign: 'center', padding: 20, color: '#999'}}>Nenhuma turma cadastrada.</Text>}
  />
);

const EnhancedModalList = withObservables([], () => ({
  classes: database.get('classes').query()
}))(ReactiveModalList);

// ==============================================================================
// RELATÓRIOS REATIVOS
// ==============================================================================
const ReactiveReportList = ({ classes }) => (
  <View>
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
);
const EnhancedReportList = withObservables([], () => ({
  classes: database.get('classes').query()
}))(ReactiveReportList);


// ==============================================================================
// TELA PRINCIPAL (ADMIN)
// Agora gerencia apenas o Estado do Formulário (UI), não os dados do Banco!
// ==============================================================================

const AdminScreen = () => {
  const [tab, setTab] = useState('class');
  
  // States Formulário (Isso SIM deve ser useState)
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('');
  
  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  
  // Selection States
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState(''); 
  const [isClassModalVisible, setClassModalVisible] = useState(false);

  // --- MÁSCARA ---
  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, '').substring(0, 11);
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    if (cleaned.length > 7) formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    setParentPhone(formatted);
  };

  // --- ACTIONS (Sem precisar recarregar lista manualmente!) ---
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
    // Nota: Não precisamos chamar loadClasses(), a lista atualiza sozinha!
  };

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

  // --- DELETES ---
  const confirmDeleteClass = (classItem) => {
    Alert.alert("Excluir Turma?", `Apagar "${classItem.name}" e TODOS os alunos?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: 'destructive', onPress: async () => {
          await database.write(async () => {
            const students = await database.get('students').query(Q.where('class_id', classItem.id)).fetch();
            for (const s of students) {
              const atts = await database.get('attendances').query(Q.where('student_id', s.id)).fetch();
              for (const a of atts) await a.destroyPermanently();
              await s.destroyPermanently();
            }
            await classItem.destroyPermanently();
          });
          if (selectedClassId === classItem.id) { setSelectedClassId(''); setSelectedClassName(''); }
      }}
    ]);
  };

  const confirmDeleteStudent = (studentItem) => {
    Alert.alert("Excluir Aluno?", `Apagar "${studentItem.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: 'destructive', onPress: async () => {
          await database.write(async () => {
            const atts = await database.get('attendances').query(Q.where('student_id', studentItem.id)).fetch();
            for (const a of atts) await a.destroyPermanently();
            await studentItem.destroyPermanently();
          });
      }}
    ]);
  };

  // --- SELECTION ---
  const handleSelectClass = (cls) => {
    setSelectedClassId(cls.id);
    setSelectedClassName(`${cls.name} - ${cls.grade}`);
    setClassModalVisible(false);
  };

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
        
        {/* ABA 1: TURMAS */}
        {tab === 'class' && (
          <View>
            <Text style={styles.headerTitle}>Gerenciar Turmas</Text>
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Nova Turma</Text>
              <TextInput style={styles.input} placeholder="Nome (Ex: Matemática)" value={className} onChangeText={setClassName} />
              <TextInput style={styles.input} placeholder="Série (Ex: 3º Ano B)" value={classGrade} onChangeText={setClassGrade} />
              <TouchableOpacity style={styles.miniButton} onPress={handleCreateClass}>
                <Text style={styles.miniButtonText}>+ Adicionar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Turmas Cadastradas</Text>
            {/* AQUI ESTÁ O COMPONENTE REATIVO */}
            <EnhancedClassList onDelete={confirmDeleteClass} />
          </View>
        )}

        {/* ABA 2: ALUNOS */}
        {tab === 'student' && (
          <View>
            <Text style={styles.headerTitle}>Gerenciar Alunos</Text>
            <Text style={styles.label}>Selecione a Turma:</Text>
            <TouchableOpacity onPress={() => setClassModalVisible(true)}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="domain" size={20} color="#666" style={styles.inputIcon} />
                <Text style={[styles.inputText, { color: selectedClassName ? '#333' : '#aaa' }]}>
                  {selectedClassName || "Toque para selecionar..."}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#666" style={{marginRight: 10}} />
              </View>
            </TouchableOpacity>

            {selectedClassId ? (
              <>
                <View style={styles.formCard}>
                  <Text style={styles.cardTitle}>Novo Aluno</Text>
                  <TextInput style={styles.input} placeholder="Nome Completo" value={studentName} onChangeText={setStudentName} />
                  <TextInput style={styles.input} placeholder="(DDD) 9XXXX-XXXX" keyboardType="numeric" value={parentPhone} onChangeText={handlePhoneChange} maxLength={15} />
                  <TouchableOpacity style={styles.miniButton} onPress={handleCreateStudent}>
                    <Text style={styles.miniButtonText}>+ Matricular</Text>
                  </TouchableOpacity>
                </View>

                {/* AQUI ESTÁ A LISTA DE ALUNOS REATIVA */}
                <EnhancedStudentList classId={selectedClassId} className={selectedClassName.split('-')[0]} onDelete={confirmDeleteStudent} />
              </>
            ) : (
              <View style={{marginTop: 50, alignItems: 'center'}}>
                <MaterialIcons name="arrow-upward" size={40} color="#ccc" />
                <Text style={{color: '#999', marginTop: 10}}>Selecione uma turma acima.</Text>
              </View>
            )}
          </View>
        )}

        {/* ABA 3: RELATÓRIOS */}
        {tab === 'reports' && (
          <View>
            <Text style={styles.headerTitle}>Central de Relatórios</Text>
            <Text style={styles.infoText}>Toque para gerar e imprimir o PDF.</Text>
            {/* LISTA DE RELATÓRIOS REATIVA */}
            <EnhancedReportList />
          </View>
        )}
        <View style={{height: 100}} />
      </ScrollView>

      {/* MODAL (AGORA TAMBÉM REATIVO!) */}
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
          {/* LISTA DO MODAL REATIVA */}
          <EnhancedModalList onSelect={handleSelectClass} selectedId={selectedClassId} />
        </View>
      </Modal>

    </View>
  );
};

// ... (Mantenha os estilos exatamente iguais ao anterior) ...
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, height: 50 },
  inputIcon: { marginLeft: 10, marginRight: 5 },
  inputText: { flex: 1, padding: 10, fontSize: 16 },
  formCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#6200ee', marginBottom: 10 },
  input: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
  miniButton: { backgroundColor: '#6200ee', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  miniButtonText: { color: '#fff', fontWeight: 'bold' },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#888', marginTop: 10, marginBottom: 10, textTransform: 'uppercase' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#6200ee', elevation: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemSubtitle: { fontSize: 12, color: '#666' },
  deleteButton: { padding: 5 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 10, fontStyle: 'italic' },
  infoText: { color: '#666', marginBottom: 15 },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  reportIconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f3e5f5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  reportTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  reportSubtitle: { color: '#666' },
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