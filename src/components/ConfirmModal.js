
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';

const ConfirmModal = ({ isVisible, onClose, onConfirm, title, message }) => {
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            animationIn="zoomIn" // Animação de entrada chique
            animationOut="zoomOut"
            backdropOpacity={0.4}
        >
            <View style={styles.modalContainer}>
                <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 30 }}>⚠️</Text>
                </View>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>

                <View style={styles.buttonRow}>
                    {/* Botão Cancelar */}
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>

                    {/* Botão Confirmar (Perigo) */}
                    <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                        <Text style={styles.confirmText}>Remover</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center',
        marginBottom: 15
    },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    message: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },
    buttonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    cancelButton: {
        flex: 1, padding: 12, borderRadius: 10,
        backgroundColor: '#f5f5f5', marginRight: 10, alignItems: 'center'
    },
    confirmButton: {
        flex: 1, padding: 12, borderRadius: 10,
        backgroundColor: '#FFEBEE', alignItems: 'center' // Fundo vermelho claro
    },
    cancelText: { color: '#666', fontWeight: 'bold' },
    confirmText: { color: '#D32F2F', fontWeight: 'bold' } // Texto vermelho escuro
});

export default ConfirmModal;