import { Model } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'

export default class Attendance extends Model {
  static table = 'attendances'

  // @date converte automaticamente timestamp <-> Objeto Date do JS
  @date('date') date
  @field('present') present
  @field('synced') synced

  // Relacionamento: Essa chamada pertence a qual aluno?
  @relation('students', 'student_id') student
}