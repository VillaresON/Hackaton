import React from 'react';
import { FlatList } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../database'; // Importamos a instância do banco
import StudentItem from './StudentItem';

const StudentList = ({ students }) => {
    return (
        <FlatList
            data={students}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <StudentItem student={item} />}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
    );
};

// A Conexão com o Banco: Buscamos a tabela 'students' e chamamos .query() para pegar todos, O withObservables assina essa query. Se adicionar um aluno novo, a lista atualiza.

const enhance = withObservables([], () => ({
    students: database.get('students').query(),
}));

export default enhance(StudentList);