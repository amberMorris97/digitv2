import db from '@/lib/db/mysql';
import { getSelf } from '@/lib/auth-service';

export const getRecommended = async () => {
  let userId;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  let users = [];
  let query = '';

  if (userId) {
    query = `
      SELECT u.*, s.*
      FROM User AS u
      LEFT JOIN Follow f ON u.id = followingId AND f.followerId = ?
      LEFT JOIN Block b1 on u.id = b1.blockedId AND b1.blockerId = ?
      LEFT JOIN Block b2 on u.id = b2.blockerId AND b2.blockedId = ?
      LEFT JOIN Stream s on s.userId = u.id
       WHERE NOT u.id = ?
       AND f.followingId IS NULL
       AND b1.blockedId IS NULL
       AND b2.blockerId iS NULL
    `;
    users = await db.execute(query, [userId, userId, userId, userId]);

    return JSON.parse(JSON.stringify(users))[0];
  } else {
     query = `
        SELECT u.*, s.*
        FROM User AS u
        LEFT JOIN Stream s on s.userId = u.id
        ORDER BY u.createdAt DESC
      `;

     users = await db.execute(query);

    return JSON.parse(JSON.stringify(users))[0];
  }
};