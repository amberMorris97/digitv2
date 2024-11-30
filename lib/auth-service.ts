import { currentUser } from "@clerk/nextjs/server";

import db from '@/lib/db/mysql';
import { resolveQuery } from "./utils";

export const getSelf = async () => {
  const self = await currentUser();

  if (!self || !self.username) {
    throw new Error('Unauthorized');
  }

  const query = 'SELECT * FROM User WHERE externalUserId = ?';

  const [rows] = await db.execute(query, [self.id]);

  const fetchedUser = JSON.parse(JSON.stringify(rows))[0];

  if (!fetchedUser) {
    throw new Error ('Not found');
  }

  return fetchedUser;
};

export const getSelfbyUsername = async (username: string) => {
  const self = await currentUser();

  if (!self || !self.username) {
    throw new Error("Unathorized");
  }

  const query = 'SELECT * FROM User WHERE username = ?';

  const [fetchedUser] = await db.execute(query, [self.username]);

  if (!fetchedUser) {
    throw new Error("User not found");
  }

  const user = resolveQuery(fetchedUser);

  if (self.username !== user.username) {
    throw new Error("Unauthorized");
  }

  return user;
};