import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const toggleAttendance = async (student) => {
    // 1. Define o "Hoje" (zera as horas para comparar só a data)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await database.write(async () => {
        const attendancesCollection = database.get('attendances');

        // 2. Busca se JÁ EXISTE uma chamada para este aluno HOJE
        const existingAttendance = await attendancesCollection.query(
            Q.where('student_id', student.id),
            Q.where('date', today.getTime())
        ).fetch();

        if (existingAttendance.length > 0) {
            // CENÁRIO A: Já tem registro. Vamos inverter (Presente <-> Falta)
            const attendance = existingAttendance[0];
            await attendance.update(record => {
                record.present = !record.present;
                record.synced = false; // Marcar para sincronizar depois
            });
        } else {
            // CENÁRIO B: Primeira vez hoje. Vamos criar como PRESENTE.
            await attendancesCollection.create(record => {
                record.student.set(student); // Vincula ao aluno
                record.date = today.getTime();
                record.present = true; // Começa como presente
                record.synced = false;
            });
        }
    });
};