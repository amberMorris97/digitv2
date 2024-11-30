import db from "@/lib/db/mysql";

export const getUserByUsername = async (username: string) => {
  const query = 'SELECT * FROM User WHERE username = ?';

  const [fetchedUser] = await db.execute(query, [username]);

  return JSON.parse(JSON.stringify(fetchedUser))[0];
};