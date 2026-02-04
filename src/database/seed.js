// src/database/seed.js
import { database } from './index';

export async function seedDatabase() {
  const classesCollection = database.get('classes');
  
  // Se já tem turmas, não faz nada
  const count = await classesCollection.query().fetchCount();
  if (count > 0) return;

  console.log('Criando Turmas e Alunos...');

  await database.write(async () => {
    // 1. Criar Turma A
    const turmaA = await classesCollection.create(c => {
      c.name = "Matemática - Manhã";
      c.grade = "3º Ano A";
    });

    // 2. Criar Turma B
    const turmaB = await classesCollection.create(c => {
      c.name = "História - Tarde";
      c.grade = "1º Ano B";
    });

    // 3. Criar Alunos na Turma A
    const studentsCollection = database.get('students');
    const namesA = ["Ana Silva", "Bruno Santos", "Carlos Lima"];
    
    for (const name of namesA) {
      await studentsCollection.create(student => {
        student.name = name;
        student.parentPhone = '5521999999999'; // Exemplo
        student.class.set(turmaA); // Vincula à turma A
      });
    }

    // 4. Criar Alunos na Turma B
    const namesB = ["Daniela Rocha", "Eduardo Mello", "Fabiana Costa"];
    for (const name of namesB) {
      await studentsCollection.create(student => {
        student.name = name;
        student.parentPhone = '5511988888888';
        student.class.set(turmaB); // Vincula à turma B
      });
    }
  });
  console.log('Seed Completo!');
}