import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
    version: 1,
    tables: [
        // Tabela de Alunos
        tableSchema({
            name: 'students',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'parent_phone', type: 'string' }, // Para o botão do WhatsApp
            ]
        }),
        // Tabela de Chamadas (Attendance)
        tableSchema({
            name: 'attendances',
            columns: [
                { name: 'student_id', type: 'string', isIndexed: true }, // Chave estrangeira
                { name: 'date', type: 'number' }, // Datas são salvas como timestamp
                { name: 'present', type: 'boolean' }, // true = presente, false = faltou
                { name: 'synced', type: 'boolean' }, // false = precisa enviar pro servidor
            ]
        }),
    ]
})