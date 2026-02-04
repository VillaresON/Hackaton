// src/database/model/Student.js
import { Model } from '@nozbe/watermelondb'
import { field, children, relation } from '@nozbe/watermelondb/decorators'

export default class Student extends Model {
  static table = 'students'

  static associations = {
    attendances: { type: 'has_many', foreignKey: 'student_id' },
    classes: { type: 'belongs_to', key: 'class_id' }
  }

  @field('name') name
  @field('parent_phone') parentPhone

  // Relacionamentos
  @relation('classes', 'class_id') class
  @children('attendances') attendances
}