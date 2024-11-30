import db from '@/lib/db/mysql';
import { resolveQuery } from './utils';

export const getStreamByUserId = async (userId: string) => {
  let query = 'SELECT * FROM Stream WHERE userId = ?';

  const [stream] = await db.execute(query, [userId]);

  return resolveQuery(stream);
};