// src/services/ReportService.js
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const generateClassReport = async (classId) => {
    // 1. Definições de Data
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Hoje zerado

    // Primeiro dia do mês atual
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0); 

    // 2. Buscamos a Turma e os Alunos
    const classCollection = database.get('classes');
    const studentCollection = database.get('students');
    const attendanceCollection = database.get('attendances');

    const classObj = await classCollection.find(classId);
    const students = await studentCollection.query(
        Q.where('class_id', classId)
    ).fetch();

    // 3. Preparamos os dados de CADA aluno
    const studentsData = await Promise.all(students.map(async (student) => {
        // Busca Histórico Completo
        const allAttendances = await attendanceCollection.query(
            Q.where('student_id', student.id)
        ).fetch();

        // --- CORREÇÃO DO BUG AQUI ---
        // Convertemos ambas as datas para string "DD/MM/AAAA" para comparar.
        // Isso resolve o problema de Objeto vs Número ou pequenas diferenças de horário.
        const todayStr = today.toLocaleDateString('pt-BR');
        
        const todayAttendance = allAttendances.find(a => {
            // Garante que a.date seja tratado como Data
            const recordDate = new Date(a.date);
            return recordDate.toLocaleDateString('pt-BR') === todayStr;
        });
        // -----------------------------

        // Filtra chamadas deste MÊS
        const monthAttendances = allAttendances.filter(a => {
            const recordDate = new Date(a.date);
            return recordDate >= firstDayOfMonth;
        });

        // Calcula Frequência Mensal
        const totalMonth = monthAttendances.length;
        const presentMonth = monthAttendances.filter(a => a.present).length;
        
        const percentage = totalMonth > 0
            ? Math.round((presentMonth / totalMonth) * 100)
            : 100; // 100% se não houve aulas ainda

        // Define status visual
        let statusText = "Não Marcado";
        let statusColor = "#999"; // Cinza
        let statusBg = "#f0f0f0"; // Fundo cinza claro

        if (todayAttendance) {
            if (todayAttendance.present) {
                statusText = "PRESENTE";
                statusColor = "#155724"; // Verde escuro
                statusBg = "#d4edda";    // Fundo verde claro
            } else {
                statusText = "FALTA";
                statusColor = "#721c24"; // Vermelho escuro
                statusBg = "#f8d7da";    // Fundo vermelho claro
            }
        }

        return {
            name: student.name,
            statusText,
            statusColor,
            statusBg,
            percentage
        };
    }));

    // 4. HTML
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
          <div class="meta">Referência: ${firstDayOfMonth.toLocaleDateString('pt-BR')} até ${today.toLocaleDateString('pt-BR')}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 45%">Nome do Aluno</th>
              <th style="width: 30%">Status Hoje (${today.getDate()}/${today.getMonth()+1})</th>
              <th style="width: 25%">Frequência Mensal</th>
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