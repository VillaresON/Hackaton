// src/database/schema.js
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 3, // Subi a versão
  tables: [
    // ... (suas tabelas antigas: students, classes, attendances, grades) ...
    tableSchema({
      name: 'students',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'class_id', type: 'string', isIndexed: true },
        { name: 'parent_phone', type: 'string' },
      ]
    }),
    tableSchema({
      name: 'classes',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'grade', type: 'string' },
      ]
    }),
    tableSchema({
      name: 'attendances',
      columns: [
        { name: 'student_id', type: 'string', isIndexed: true },
        { name: 'date', type: 'number' },
        { name: 'present', type: 'boolean' },
        { name: 'synced', type: 'boolean' },
      ]
    }),
    tableSchema({
      name: 'grades',
      columns: [
        { name: 'student_id', type: 'string', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'value', type: 'number' },
        { name: 'date', type: 'number' },
      ]
    }),
    // --- NOVA TABELA DE TAREFAS ---
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'date', type: 'string' }, // Vamos salvar como string 'YYYY-MM-DD' para facilitar o calendário
        { name: 'class_id', type: 'string', isIndexed: true },
        { name: 'is_done', type: 'boolean' },
      ]
    }),
  ]
})