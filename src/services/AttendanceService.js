// src/services/AttendanceService.js
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const toggleAttendance = async (student) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await database.write(async () => {
        const attendancesCollection = database.get('attendances');
        const existingAttendance = await attendancesCollection.query(
            Q.where('student_id', student.id),
            Q.where('date', today.getTime())
        ).fetch();

        if (existingAttendance.length > 0) {
            const attendance = existingAttendance[0];
            await attendance.update(record => {
                record.present = !record.present;
                record.synced = false;
            });
        } else {
            await attendancesCollection.create(record => {
                record.student.set(student);
                record.date = today.getTime();
                record.present = true;
                record.synced = false;
            });
        }
    });
};

// GARANTINDO QUE ESTÁ EXPORTADA CORRETAMENTE:
export const removeAttendanceRecord = async (attendance) => {
    if (!attendance) return; // Segurança extra

    await database.write(async () => {
        // destroyPermanently apaga o registro do banco local
        await attendance.destroyPermanently();
    });
};