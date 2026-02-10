// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { syncData } from '../services/SyncService';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- Importante

const ClassCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>
      <MaterialIcons name="class" size={32} color="#6200ee" />
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle}>{item.grade}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#ccc" />
  </TouchableOpacity>
);

const HomeScreen = ({ navigation, classes, pendingCount }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  // State para o nome personalizado
  const [greeting, setGreeting] = useState('Olá, Professor(a)!');

  // --- CARREGAR PERFIL AO INICIAR ---
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const json = await AsyncStorage.getItem('user_profile');
      if (json) {
        const user = JSON.parse(json);

        // Lógica: Se 'F', usa "Professora", senão "Professor"
        const title = user.gender === 'F' ? 'Professora' : 'Professor';

        // Pega apenas o primeiro nome para não ficar gigante
        const firstName = user.name.split(' ')[0];

        setGreeting(`Olá, ${title} ${firstName}!`);
      }
    } catch (e) {
      console.log("Erro ao carregar perfil");
    }
  };
  // ----------------------------------

  const handleSync = async () => {
    if (pendingCount === 0) {
      Alert.alert("Tudo em dia!", "Não há dados pendentes para enviar.");
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncData();
      if (result.status === 'success') {
        Alert.alert("Sucesso!", `${result.total} registros enviados para a Secretaria.`);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao sincronizar. Tente novamente.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho de Resumo */}
      <View style={styles.summaryContainer}>

        <View style={styles.headerRow}>
          <View>
            {/* AQUI ESTÁ A MÁGICA: NOME PERSONALIZADO */}
            <Text style={styles.welcomeText}>{greeting}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('pt-BR')}</Text>
          </View>

          <View style={styles.actionsRow}>

            {/* BOTÃO AGENDA (Novo) */}
            <TouchableOpacity
              style={[styles.circleButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' }]}
              onPress={() => navigation.navigate('Calendar')}
            >
              <MaterialIcons name="event" size={24} color="#6200ee" />
            </TouchableOpacity>
            
            {/* Botão Admin */}
            <TouchableOpacity
              style={[styles.circleButton, styles.adminButton]}
              onPress={() => navigation.navigate('Admin')}
            >
              <MaterialIcons name="settings" size={24} color="#6200ee" />
            </TouchableOpacity>

            {/* Botão Sync */}
            <TouchableOpacity
              style={[styles.circleButton, pendingCount > 0 ? styles.syncPending : styles.syncOk]}
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name={pendingCount > 0 ? "cloud-upload" : "cloud-done"} size={24} color="#fff" />
                  {pendingCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{pendingCount}</Text>
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{classes.length}</Text>
            <Text style={styles.statLabel}>Turmas Ativas</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: pendingCount > 0 ? '#fff3e0' : '#e8f5e9' }]}>
            <Text style={[styles.statNumber, { color: pendingCount > 0 ? '#ef6c00' : '#2e7d32' }]}>
              {pendingCount > 0 ? 'Pendente' : 'Salvo'}
            </Text>
            <Text style={styles.statLabel}>Status da Nuvem</Text>
          </View>
        </View>
      </View>

      {/* Lista WatermelonDB */}
      <Text style={styles.sectionTitle}>Minhas Turmas</Text>
      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ClassCard
            item={item}
            onPress={() => navigation.navigate('ClassDetails', {
              classId: item.id,
              className: item.name
            })}
          />
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Ajuste no texto para não quebrar layout se o nome for grande
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#333', maxWidth: 220 },
  dateText: { fontSize: 14, color: '#666' },

  circleButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    marginLeft: 10,
  },
  adminButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee'
  },
  syncOk: { backgroundColor: '#4CAF50' },
  syncPending: { backgroundColor: '#FF9800' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { width: '48%', padding: 15, backgroundColor: '#f3e5f5', borderRadius: 12, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#6200ee' },
  statLabel: { fontSize: 12, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginTop: 20, color: '#333' },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0e6fc', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardSubtitle: { fontSize: 14, color: '#666' },
});

// WatermelonDB Connection
const enhance = withObservables([], () => ({
  classes: database.get('classes').query(),
  pendingCount: database.get('attendances').query(
    Q.where('synced', false)
  ).observeCount()
}));

export default enhance(HomeScreen);