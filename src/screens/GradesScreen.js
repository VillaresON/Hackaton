// src/screens/GradesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { saveGradesBatch, generateGradesReport, deleteGradesList } from '../services/GradeService';

const GradesScreen = ({ route, navigation }) => {
    const { classId, className } = route.params;

    const [activeTab, setActiveTab] = useState('launch'); // 'launch' ou 'history'

    const [students, setStudents] = useState([]);
    const [description, setDescription] = useState('');
    const [gradesMap, setGradesMap] = useState({});
    const [historyList, setHistoryList] = useState([]); // Lista de avaliações passadas

    useEffect(() => {
        loadStudentsAndHistory();
    }, []);

    // Recarrega o histórico sempre que mudar de aba para 'history'
    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    const loadStudentsAndHistory = async () => {
        // Carrega Alunos
        const list = await database.get('students').query(Q.where('class_id', classId)).fetch();
        setStudents(list);

        // Inicializa inputs vazios
        const initialMap = {};
        list.forEach(s => initialMap[s.id] = '');
        setGradesMap(initialMap);

        loadHistory(list); // Carrega histórico baseado nesses alunos
    };

    const loadHistory = async (studentList = students) => {
        if (studentList.length === 0) return;

        // Busca IDs dos alunos da turma
        const studentIds = studentList.map(s => s.id);

        // Busca TODAS as notas desses alunos
        // Nota: Query 'oneOf' pode ter limite no SQLite, mas para uma turma ok.
        const allGrades = await database.get('grades').query(
            Q.where('student_id', Q.oneOf(studentIds))
        ).fetch();

        // Agrupa por Descrição + Data
        const groups = {};

        allGrades.forEach(g => {
            const dateStr = new Date(g.date).toLocaleDateString('pt-BR');
            const key = `${g.description}|${g.date}`; // Chave única

            if (!groups[key]) {
                groups[key] = {
                    description: g.description,
                    dateTimestamp: g.date,
                    dateLabel: dateStr,
                    count: 0,
                    totalValue: 0,
                    grades: [] // Guarda as notas para reimpressão
                };
            }
            groups[key].count++;
            groups[key].grades.push(g);
        });

        // Transforma em array e ordena pela data (mais recente primeiro)
        const history = Object.values(groups).sort((a, b) => b.dateTimestamp - a.dateTimestamp);
        setHistoryList(history);
    };

    // --- ABA LANÇAR ---
    const handleGradeChange = (studentId, text) => {
        setGradesMap(prev => ({ ...prev, [studentId]: text }));
    };

    const handleSave = async () => {
        if (!description.trim()) return Alert.alert("Atenção", "Dê um nome para a avaliação.");

        const dataToSave = Object.keys(gradesMap).map(studentId => ({
            studentId,
            score: gradesMap[studentId]
        }));

        // Verifica se tem pelo menos uma nota digitada
        if (!dataToSave.some(d => d.score !== '')) {
            return Alert.alert("Vazio", "Lance a nota de pelo menos um aluno.");
        }

        try {
            await saveGradesBatch(dataToSave, description);
            Alert.alert("Sucesso", "Notas salvas!", [
                {
                    text: "OK", onPress: () => {
                        // Limpa formulário e vai para histórico
                        setDescription('');
                        const cleanMap = {};
                        students.forEach(s => cleanMap[s.id] = '');
                        setGradesMap(cleanMap);
                        setActiveTab('history');
                    }
                }
            ]);
        } catch (e) {
            Alert.alert("Erro", "Falha ao salvar notas.");
        }
    };

    // --- ABA HISTÓRICO: Ações ---

    const handlePrintHistory = async (item) => {
        // Reconstrói a lista { name, score } para o PDF
        // Precisamos cruzar com a lista de alunos 'students' para pegar os nomes
        const dataForReport = students.map(student => {
            // Tenta achar a nota desse aluno neste grupo de avaliação
            const gradeRecord = item.grades.find(g => g.student.id === student.id);
            return {
                name: student.name,
                score: gradeRecord ? String(gradeRecord.value) : '-'
            };
        });

        await generateGradesReport(classId, item.description, dataForReport);
    };

    const handleDeleteHistory = (item) => {
        Alert.alert(
            "Excluir Lançamento?",
            `Deseja apagar todas as notas de "${item.description}" do dia ${item.dateLabel}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Correção: Passamos direto a lista de objetos (item.grades) que já temos carregada
                            await deleteGradesList(item.grades);

                            Alert.alert("Sucesso", "Notas excluídas.");
                            loadHistory(); // Atualiza a lista na tela
                        } catch (e) {
                            console.error(e); // Ajuda a ver o erro real no console se acontecer
                            Alert.alert("Erro", "Não foi possível excluir. Tente recarregar a tela.");
                        }
                    }
                }
            ]
        );
    };

    // --- UI COMPONENTS ---

    const TabButton = ({ id, icon, label }) => (
        <TouchableOpacity onPress={() => setActiveTab(id)} style={[styles.tab, activeTab === id && styles.activeTab]}>
            <MaterialIcons name={icon} size={24} color={activeTab === id ? "#6200ee" : "#888"} />
            <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

            {/* HEADER DA TELA */}
            <View style={styles.header}>
                <Text style={styles.title}>{className}</Text>
                <Text style={styles.subtitle}>Gestão de Notas</Text>
            </View>

            {/* TABS */}
            <View style={styles.tabBar}>
                <TabButton id="launch" icon="edit" label="Lançar Notas" />
                <TabButton id="history" icon="history" label="Histórico Salvo" />
            </View>

            {/* CONTEÚDO */}
            <View style={styles.content}>

                {/* === ABA 1: LANÇAR === */}
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

                {/* === ABA 2: HISTÓRICO === */}
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

    // Estilos do Formulário
    inputContainer: { padding: 15, backgroundColor: '#fff', margin: 10, borderRadius: 8, elevation: 1 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5 },
    descInput: { borderBottomWidth: 1, borderColor: '#6200ee', fontSize: 16, paddingVertical: 5, color: '#333' },

    studentRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#fff', padding: 15, marginHorizontal: 10, marginTop: 5, borderRadius: 8, elevation: 1
    },
    studentName: { fontSize: 16, color: '#333', flex: 1 },
    gradeInput: {
        width: 60, height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 4,
        textAlign: 'center', fontSize: 16, backgroundColor: '#f9f9f9', color: '#333'
    },

    fabSave: {
        position: 'absolute', bottom: 20, right: 20,
        backgroundColor: '#6200ee', flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, elevation: 5
    },
    fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },

    // Estilos do Histórico
    historyCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#fff', padding: 15, marginHorizontal: 10, marginTop: 10, borderRadius: 8, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#6200ee'
    },
    historyInfo: { flex: 1 },
    historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    historyDate: { fontSize: 12, color: '#666', marginTop: 4 },
    historyActions: { flexDirection: 'row' },
    actionButton: { padding: 8, marginLeft: 5 },

    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', marginTop: 10, fontSize: 16 }
});

export default GradesScreen;