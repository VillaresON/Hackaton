// src/database/model/Class.js
import { Model } from '@nozbe/watermelondb'
import { field, children } from '@nozbe/watermelondb/decorators'

export default class Class extends Model {
  static table = 'classes'

  // --- CORREÇÃO AQUI ---
  static associations = {
    students: { type: 'has_many', foreignKey: 'class_id' }
  }

  @field('name') name
  @field('grade') grade

  @children('students') students
}