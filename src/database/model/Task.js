// src/database/model/Task.js
import { Model } from '@nozbe/watermelondb'
import { field, relation } from '@nozbe/watermelondb/decorators'

export default class Task extends Model {
    static table = 'tasks'

    @field('title') title
    @field('description') description
    @field('date') date
    @field('is_done') isDone

    @relation('classes', 'class_id') classInfo
}