// src/services/AttendanceReportService.js
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const generateAttendanceReport = async (classId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const classCollection = database.get('classes');
    const studentCollection = database.get('students');
    const attendanceCollection = database.get('attendances');

    const classObj = await classCollection.find(classId);
    const students = await studentCollection.query(
        Q.where('class_id', classId)
    ).fetch();

    const studentsData = await Promise.all(students.map(async (student) => {
        const allAttendances = await attendanceCollection.query(
            Q.where('student_id', student.id)
        ).fetch();

        const todayStr = today.toLocaleDateString('pt-BR');
        const todayAttendance = allAttendances.find(a => {
            const recordDate = new Date(a.date);
            return recordDate.toLocaleDateString('pt-BR') === todayStr;
        });

        const totalAttendances = allAttendances.length;
        const totalAbsences = allAttendances.filter(a => !a.present).length;
        const percentage = totalAttendances > 0
            ? Math.round(((totalAttendances - totalAbsences) / totalAttendances) * 100)
            : 100;

        let statusText = "Não Marcado";
        let statusColor = "#999";
        let statusBg = "#f0f0f0";

        if (todayAttendance) {
            if (todayAttendance.present) {
                statusText = "PRESENTE";
                statusColor = "#155724";
                statusBg = "#d4edda";
            } else {
                statusText = "FALTA";
                statusColor = "#721c24";
                statusBg = "#f8d7da";
            }
        }

        return {
            name: student.name,
            statusText,
            statusColor,
            statusBg,
            totalAttendances,
            totalAbsences,
            percentage
        };
    }));

    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 30px; color: #333; }

          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
          h2 { margin: 8px 0; font-size: 16px; font-weight: normal; }
          .meta { font-size: 12px; color: #666; margin-top: 5px; text-transform: uppercase; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f8f9fa; text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6; font-size: 11px; text-transform: uppercase; color: #555; }
          td { border-bottom: 1px solid #dee2e6; padding: 10px; font-size: 13px; vertical-align: middle; }

          tr:nth-child(even) { background-color: #fdfdfd; }

          .status-badge {
            font-weight: bold;
            font-size: 10px;
            padding: 5px 10px;
            border-radius: 15px;
            text-transform: uppercase;
            display: inline-block;
            min-width: 80px;
            text-align: center;
          }

          .footer { margin-top: 60px; text-align: center; page-break-inside: avoid; }
          .signature-box { width: 50%; margin: 0 auto; border-top: 1px solid #000; padding-top: 8px; font-weight: bold; font-size: 12px; }
          .timestamp { font-size: 9px; color: #aaa; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Frequência</h1>
          <h2>Turma: ${classObj.name} (${classObj.grade})</h2>
          <div class="meta">Data: ${today.toLocaleDateString('pt-BR')}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35%">Nome do Aluno</th>
              <th style="width: 25%">Status Hoje</th>
              <th style="width: 20%">Total Faltas</th>
              <th style="width: 20%">Frequência</th>
            </tr>
          </thead>
          <tbody>
            ${studentsData.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>
                  <span class="status-badge" style="color: ${s.statusColor}; background-color: ${s.statusBg};">
                    ${s.statusText}
                  </span>
                </td>
                <td style="font-weight: bold; color: ${s.totalAbsences > 0 ? '#d32f2f' : '#333'};">${s.totalAbsences}</td>
                <td style="font-weight: bold;">${s.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="signature-box">Assinatura do(a) Professor(a)</div>
          <div class="timestamp">Gerado via Diário Offline em ${new Date().toLocaleString('pt-BR')}</div>
        </div>
      </body>
    </html>
    `;

    try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error("Erro PDF:", error);
    }
};
