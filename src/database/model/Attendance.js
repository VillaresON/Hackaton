// src/database/model/Attendance.js
import { Model } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'

export default class Attendance extends Model {
  static table = 'attendances'

  // --- CORREÇÃO AQUI ---
  static associations = {
    students: { type: 'belongs_to', key: 'student_id' }
  }

  @date('date') date
  @field('present') present
  @field('synced') synced

  @relation('students', 'student_id') student
}