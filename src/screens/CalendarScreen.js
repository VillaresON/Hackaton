// src/screens/CalendarScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

// Configuração para Português
LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const CalendarScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState([]);
    const [markedDates, setMarkedDates] = useState({});
    const [classes, setClasses] = useState([]);

    // States do Modal de Criação
    const [isModalVisible, setModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [selectedClassId, setSelectedClassId] = useState(null);

    useEffect(() => {
        loadClasses();
        loadAllTasks(); // Para marcar as bolinhas no calendário
    }, []);

    useEffect(() => {
        loadTasksForDay(selectedDate);
    }, [selectedDate]);

    const loadClasses = async () => {
        const list = await database.get('classes').query().fetch();
        setClasses(list);
    };

    // Carrega TODAS as tarefas apenas para saber onde por a bolinha no calendário
    const loadAllTasks = async () => {
        const all = await database.get('tasks').query().fetch();
        const marks = {};

        all.forEach(t => {
            marks[t.date] = { marked: true, dotColor: '#6200ee' };
        });

        // Marca o dia selecionado com um círculo roxo
        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: '#6200ee'
        };

        setMarkedDates(marks);
    };

    // Carrega tarefas do dia específico com os dados da Turma
    const loadTasksForDay = async (date) => {
        const dayTasks = await database.get('tasks').query(
            Q.where('date', date)
        ).fetch();

        // Precisamos pegar o nome da turma de cada tarefa
        const enrichedTasks = await Promise.all(dayTasks.map(async (task) => {
            const classObj = await task.classInfo.fetch();
            return {
                id: task.id,
                title: task.title,
                description: task.description,
                isDone: task.isDone,
                className: classObj ? classObj.name : 'Geral',
                classGrade: classObj ? classObj.grade : '',
                raw: task // Guarda o objeto original para updates
            };
        }));

        setTasks(enrichedTasks);
    };

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        // Atualiza visual do calendário
        setMarkedDates(prev => ({
            ...prev,
            [selectedDate]: { ...prev[selectedDate], selected: false }, // Desmarca anterior
            [day.dateString]: { ...prev[day.dateString], selected: true, selectedColor: '#6200ee' } // Marca novo
        }));
    };

    const handleSaveTask = async () => {
        if (!newTaskTitle || !selectedClassId) {
            Alert.alert("Ops", "Título e Turma são obrigatórios");
            return;
        }

        await database.write(async () => {
            const classObj = await database.get('classes').find(selectedClassId);
            await database.get('tasks').create(t => {
                t.title = newTaskTitle;
                t.description = newTaskDesc;
                t.date = selectedDate;
                t.isDone = false;
                t.classInfo.set(classObj);
            });
        });

        setModalVisible(false);
        setNewTaskTitle(''); setNewTaskDesc(''); setSelectedClassId(null);
        loadAllTasks(); // Atualiza bolinhas
        loadTasksForDay(selectedDate); // Atualiza lista
    };

    const toggleTaskDone = async (taskItem) => {
        await database.write(async () => {
            await taskItem.raw.update(t => {
                t.isDone = !t.isDone;
            });
        });
        loadTasksForDay(selectedDate);
    };

    const deleteTask = async (taskItem) => {
        Alert.alert("Excluir", "Deseja remover esta tarefa?", [
            { text: "Cancelar" },
            {
                text: "Sim", onPress: async () => {
                    await database.write(async () => {
                        await taskItem.raw.destroyPermanently();
                    });
                    loadAllTasks();
                    loadTasksForDay(selectedDate);
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>

            {/* 1. O CALENDÁRIO */}
            <Calendar
                current={selectedDate}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                theme={{
                    selectedDayBackgroundColor: '#6200ee',
                    todayTextColor: '#6200ee',
                    arrowColor: '#6200ee',
                    textDayFontWeight: 'bold',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: 'bold',
                }}
            />

            {/* 2. LISTA DE TAREFAS (CARDS) */}
            <View style={styles.listContainer}>
                <Text style={styles.listHeader}>Agendamentos para o dia {new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>

                <FlatList
                    data={tasks}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialIcons name="event-busy" size={40} color="#ccc" />
                            <Text style={{ color: '#999', marginTop: 10 }}>Nada agendado para hoje.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.card, item.isDone && styles.cardDone]}>
                            <View style={styles.cardLeftBorder} />
                            <View style={{ flex: 1, padding: 15 }}>

                                <View style={styles.cardHeader}>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.className} - {item.classGrade}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => deleteTask(item)}>
                                        <MaterialIcons name="delete-outline" size={20} color="#bbb" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={[styles.cardTitle, item.isDone && styles.textDone]}>{item.title}</Text>
                                {item.description ? <Text style={styles.cardDesc}>{item.description}</Text> : null}
                            </View>

                            <TouchableOpacity style={styles.checkButton} onPress={() => toggleTaskDone(item)}>
                                <MaterialIcons name={item.isDone ? "check-circle" : "radio-button-unchecked"} size={28} color={item.isDone ? "#4CAF50" : "#ccc"} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            {/* FAB (Botão Flutuante) */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* 3. MODAL DE CRIAÇÃO */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setModalVisible(false)}
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Nova Tarefa</Text>
                    <Text style={styles.modalSub}>Para o dia {new Date(selectedDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Título (Ex: Prova, Entrega de Trabalho)"
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                    />

                    <TextInput
                        style={[styles.input, { height: 80 }]}
                        placeholder="Descrição (Opcional)"
                        multiline
                        value={newTaskDesc}
                        onChangeText={setNewTaskDesc}
                    />

                    <Text style={styles.label}>Para qual turma?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                        {classes.map(cls => (
                            <TouchableOpacity
                                key={cls.id}
                                style={[styles.classChip, selectedClassId === cls.id && styles.classChipSelected]}
                                onPress={() => setSelectedClassId(cls.id)}
                            >
                                <Text style={[styles.classChipText, selectedClassId === cls.id && { color: '#fff' }]}>
                                    {cls.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                        <Text style={styles.saveButtonText}>AGENDAR</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },

    listContainer: { flex: 1, padding: 15 },
    listHeader: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 10, textTransform: 'uppercase', backgroundColor: '#6200ee', borderRadius: 8, textAlign: 'center' },

    // Card Style (Trello Like)
    card: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, elevation: 2, overflow: 'hidden'
    },
    cardDone: { opacity: 0.6, backgroundColor: '#f0f0f0' },
    cardLeftBorder: { width: 5, backgroundColor: '#6200ee' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },

    badge: { backgroundColor: '#ede7f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    badgeText: { color: '#6200ee', fontSize: 10, fontWeight: 'bold' },

    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    textDone: { textDecorationLine: 'line-through', color: '#888' },
    cardDesc: { fontSize: 13, color: '#666', marginTop: 4 },

    checkButton: { justifyContent: 'center', paddingHorizontal: 15, borderLeftWidth: 1, borderLeftColor: '#eee' },

    emptyState: { alignItems: 'center', marginTop: 40 },

    // FAB
    fab: {
        position: 'absolute', bottom: 20, right: 20, width: 60, height: 60,
        borderRadius: 30, backgroundColor: '#6200ee',
        justifyContent: 'center', alignItems: 'center', elevation: 5
    },

    // Modal
    modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    modalSub: { fontSize: 14, color: '#666', marginBottom: 20 },
    input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },

    label: { fontWeight: 'bold', color: '#666', marginBottom: 10 },
    classChip: { padding: 10, backgroundColor: '#eee', borderRadius: 20, marginRight: 10 },
    classChipSelected: { backgroundColor: '#6200ee' },
    classChipText: { fontWeight: 'bold', color: '#555' },

    saveButton: { backgroundColor: '#6200ee', padding: 15, borderRadius: 10, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default CalendarScreen;