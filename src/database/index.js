import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './schema'
import Student from './model/Student'
import Attendance from './model/Attendance'
import Class from './model/Class'

//Criamos o adaptador (a ponte entre o JS e o SQLite nativo)
const adapter = new SQLiteAdapter({
  schema,
  jsi: true,

  onSetUpError: error => {
    console.error('Erro ao carregar banco de dados:', error)
  }
})

// 2. Instanciamos o Banco de Dados
export const database = new Database({
  adapter,
  modelClasses: [
    Class,
    Student,
    Attendance,
  ],
})