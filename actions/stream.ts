"use server";

import { Stream } from "@prisma/client";
import { revalidatePath } from "next/cache";

import db from '@/lib/db/mysql';
import { getSelf } from "@/lib/auth-service";
import { resolveQuery } from "@/lib/utils";

export const updateStream = async (values: Partial<Stream>) => {
  try {
    const self = await getSelf();

    let query = 'SELECT * FROM Stream WHERE userId = ?';

    const [streamResult] = await db.execute(query, [self.id]);

    const selfStream = resolveQuery(streamResult);

    if (!selfStream) {
      throw new Error("Stream not found");
    }

    const updateCol = Object.keys(values)[0];

    if (updateCol === 'isChatEnabled') {
      query = 'UPDATE Stream SET isChatEnabled = ?';
    } else if (updateCol === 'isChatDelayed') {
      query = 'UPDATE Stream SET isChatDelayed = ?'
    } else {
      query = 'UPDATE Stream SET isChatFollowersOnly = ?';
    }

    query += ' WHERE id = ?';

    const updateVal = Object.values(values)[0];

    const updateStream = await db.execute(query, [updateVal, selfStream.id]);

    revalidatePath(`/u/${self.username}/chat`);
    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}`);

    return updateStream;
  } catch {
    throw new Error("Internal error")
  }
}