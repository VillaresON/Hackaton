import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const syncData = async () => {
  const attendancesCollection = database.get('attendances');

  // 1. Busca tudo que ainda NÃO foi sincronizado (synced = false)
  const pendingAttendances = await attendancesCollection.query(
    Q.where('synced', false)
  ).fetch();

  const total = pendingAttendances.length;

  if (total === 0) {
    return { status: 'no_data' };
  }

  // 2. Simula o tempo de rede (Network Request)
  // Num app real, aqui você faria um: await api.post('/sync', data)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3. Marca tudo como sincronizado no banco local
  await database.write(async () => {
    // Atualiza em lote (Batch) para ser super rápido
    const operations = pendingAttendances.map(record => 
      record.prepareUpdate(r => {
        r.synced = true;
      })
    );
    await database.batch(...operations);
  });

  return { status: 'success', total };
};