// src/database/schema.js
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 4, // Atualizei a versão para refletir a remoção da tabela
  tables: [
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
    // Tabela nova de Notas
    tableSchema({
      name: 'grades',
      columns: [
        { name: 'student_id', type: 'string', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'value', type: 'number' },
        { name: 'date', type: 'number' },
      ]
    }),
  ]
})