// src/database/schema.js
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 2, // Aumentamos a versão (importante!)
  tables: [
    tableSchema({
      name: 'classes', // Nova tabela de Turmas
      columns: [
        { name: 'name', type: 'string' },
        { name: 'grade', type: 'string' }, // Ex: "3º Ano B"
      ]
    }),
    tableSchema({
      name: 'students',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'parent_phone', type: 'string' },
        { name: 'class_id', type: 'string', isIndexed: true }, // Vínculo com a turma
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
  ]
})