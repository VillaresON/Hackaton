// src/services/GradeService.js
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Salva notas em lote
export const saveGradesBatch = async (gradesData, description) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliza para o dia (sem horas quebradas)
    const todayTimestamp = today.getTime();

    await database.write(async () => {
        const gradesCollection = database.get('grades');

        for (const item of gradesData) {
            if (item.score !== '') {
                await gradesCollection.create(grade => {
                    grade.student.id = item.studentId;
                    grade.value = parseFloat(item.score.replace(',', '.'));
                    grade.description = description;
                    grade.date = todayTimestamp;
                });
            }
        }
    });
};

export const deleteGradesList = async (gradesList) => {
    await database.write(async () => {
        const deletions = gradesList.map(grade => grade.prepareDestroyPermanently());
        await database.batch(deletions);
    });
};

// Gera PDF
export const generateGradesReport = async (classId, description, gradesList) => {
    const classObj = await database.get('classes').find(classId);

    // O html continua o mesmo...
    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 30px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { margin: 0; text-transform: uppercase; font-size: 20px; }
          h2 { margin: 5px 0; font-size: 16px; font-weight: normal; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f0f0f0; padding: 10px; border: 1px solid #ccc; text-align: left; font-size: 12px; text-transform: uppercase; }
          td { padding: 10px; border: 1px solid #ccc; font-size: 14px; }
          .score { font-weight: bold; text-align: center; }
          .footer { margin-top: 50px; text-align: center; border-top: 1px solid #000; padding-top: 10px; width: 60%; margin-left: auto; margin-right: auto; font-size: 12px;}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Notas</h1>
          <h2>Turma: ${classObj.name} (${classObj.grade})</h2>
          <h3>Avaliação: ${description}</h3>
          <p>Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 70%">Aluno</th>
              <th style="width: 30%; text-align: center">Nota</th>
            </tr>
          </thead>
          <tbody>
            ${gradesList.map(r => `
              <tr>
                <td>${r.name}</td>
                <td class="score">${r.score}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Assinatura do Professor</div>
      </body>
    </html>
  `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
};