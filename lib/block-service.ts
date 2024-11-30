import db from "@/lib/db/mysql";
import { getSelf } from "@/lib/auth-service";
import { QueryResult } from "mysql2";

export const isBlockedByUser = async (id: string) => {
  try {
    const self = await getSelf();
    let query;

    query = 'SELECT * FROM User WHERE id = ?';
    const [fetchOtherUser] = await db.execute(query, [id]);

    if (!fetchOtherUser) {
      throw new Error("User not found");
    }

    const otherUser = resolveQuery(fetchOtherUser);

    if (otherUser.id === self.id) {
      return false;
    }

    query = `SELECT * FROM Block WHERE blockerId = ? AND blockedId = ? LIMIT 1`;

    const [existingBlock] = await db.execute(query, [otherUser.id, self.id]);

    return !!resolveQuery(existingBlock);
  } catch {
    return false;
  }
};

export const blockUser = async (id: string) => {
  const self = await getSelf();

  if (self.id === id) {
    throw new Error("Cannot block yourself");
  }

  let query;

  query = `SELECT * FROM User WHERE id = ? LIMIT 1`;

  const [fetchOtherUser] = await db.execute(query, [id]);

  if (!fetchOtherUser) {
    throw new Error("User not found");
  }

  const otherUser = resolveQuery(fetchOtherUser);

  query = `SELECT * FROM Block WHERE blockerId = ? AND blockedId = ? LIMIT 1`;

  const [fetchExistingBlock] = await db.execute(query, [self.id, otherUser.id]);

  const existingBlock = resolveQuery(fetchExistingBlock);

  if (existingBlock) {
    throw new Error("Already blocked");
  }

  const insertQuery = `INSERT INTO Block (blockerId, blockedId) VALUES (?, ?)`;

  const [result] = await db.execute(insertQuery, [self.id, otherUser.id]);

  if (JSON.parse(JSON.stringify(result)).affectedRows > 0) {
    return otherUser;
  } else {
    throw new Error("Failed to block the user.");
  }
};

export const unblockUser = async (id: string) => {
  const self = await getSelf();
  let query;

  if (self.id === id) {
    throw new Error("Cannot unblock yourself");
  }

  query = 'SELECT * FROM User WHERE id = ?';

  const [fetchOtherUser] = await db.execute(query, [id]);

  if (!fetchOtherUser) {
    throw new Error("User not found");
  }

  const otherUser = resolveQuery(fetchOtherUser);

  query = `SELECT * FROM Block WHERE blockerId = ? AND blockedId = ?`;

  const [fetchExistingBlock] = await db.execute(query, [self.id, otherUser.id]);

  if (!fetchExistingBlock) {
    throw new Error("Not blocked")
  }

  query = `DELETE FROM Block WHERE blockerId = ? AND blockedId = ?`;

  const [result] = await db.execute(query, [self.id, otherUser.id]);

  if (JSON.parse(JSON.stringify(result)).affectedRows > 0) {
    return otherUser;
  } else {
    return [];
  }
};

export const resolveQuery = (query: QueryResult) => JSON.parse(JSON.stringify(query))[0];