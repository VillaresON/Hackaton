// src/database/model/Grade.js
import { Model } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'

export default class Grade extends Model {
  static table = 'grades'

  static associations = {
    students: { type: 'belongs_to', key: 'student_id' }
  }

  // --- ESSA LINHA É CRUCIAL. SE FALTAR, DÁ O ERRO QUE VOCÊ VIU ---
  @field('description') description 
  @field('value') value
  @date('date') date
  
  @relation('students', 'student_id') student
}