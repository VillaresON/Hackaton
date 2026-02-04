// src/services/AttendanceService.js
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

// Função genérica para criar ou atualizar
const setStatus = async (student, isPresent) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await database.write(async () => {
    const attendancesCollection = database.get('attendances');
    const existingAttendance = await attendancesCollection.query(
      Q.where('student_id', student.id),
      Q.where('date', today.getTime())
    ).fetch();

    if (existingAttendance.length > 0) {
      // Se já existe, atualiza o status
      const attendance = existingAttendance[0];
      await attendance.update(record => {
        record.present = isPresent;
        record.synced = false;
      });
    } else {
      // Se não existe, cria
      await attendancesCollection.create(record => {
        record.student.set(student);
        record.date = today.getTime();
        record.present = isPresent;
        record.synced = false;
      });
    }
  });
};

export const markPresent = async (student) => setStatus(student, true);
export const markAbsent = async (student) => setStatus(student, false);

export const removeAttendanceRecord = async (attendance) => {
  if (!attendance) return;
  await database.write(async () => {
    await attendance.destroyPermanently();
  });
};