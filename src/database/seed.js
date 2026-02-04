import { database } from './index';

export async function seedDatabase() {
  const studentsCollection = database.get('students');

  // 1. Verifica se já tem dados
  const count = await studentsCollection.query().fetchCount();
  if (count > 0) {
    console.log('Banco já populado. Pulando seed.');
    return;
  }

  console.log('Semeando banco de dados...');

  const names = [
    "Ana Silva", "Bruno Santos", "Carla Oliveira", "Daniel Souza", 
    "Eduardo Lima", "Fernanda Costa", "Gabriel Pereira", "Helena Rodrigues",
    "Igor Alves", "Julia Martins", "Kaique Gomes", "Larissa Barbosa",
    "Marcos Pinto", "Natália Dias", "Otávio Rocha", "Paula Azevedo"
  ];

  await database.write(async () => {
    const operations = names.map(name => 
      studentsCollection.prepareCreate(student => {
        student.name = name;
        // Geramos um número aleatório para simular o telefone
        student.parentPhone = '5511999999999'; 
      })
    );
    await database.batch(...operations);
  });

  console.log('Seed concluído com sucesso!');
}