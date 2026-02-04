// src/database/model/Student.js
import { Model } from '@nozbe/watermelondb'
import { field, children, relation } from '@nozbe/watermelondb/decorators'

export default class Student extends Model {
  static table = 'students'

  @field('name') name
  @field('parent_phone') parentPhone
  
  // O aluno pertence a uma turma
  @relation('classes', 'class_id') class

  @children('attendances') attendances
}