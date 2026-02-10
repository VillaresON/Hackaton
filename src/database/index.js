// src/database/index.js
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

// O IMPORT ABAIXO É O MAIS IMPORTANTE:
import { mySchema } from './schema'

import Student from './model/Student'
import Class from './model/Class'
import Attendance from './model/Attendance'
import Grade from './model/Grade'
import Task from './model/Task'

const adapter = new SQLiteAdapter({
  schema: mySchema, 
  jsi: true,
  onSetUpError: error => console.log(error)
})

export const database = new Database({
  adapter,
  modelClasses: [
    Student,
    Class,
    Attendance,
    Grade,
    Task
  ],
})