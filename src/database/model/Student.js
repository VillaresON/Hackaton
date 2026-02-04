import { Model } from '@nozbe/watermelondb'
import { field, children } from '@nozbe/watermelondb/decorators'

export default class Student extends Model {
    static table = 'students'

    // Mapeia as colunas do banco para propriedades da classe
    @field('name') name
    @field('parent_phone') parentPhone

    // Relacionamento: Um aluno tem muitas chamadas
    @children('attendances') attendances
}