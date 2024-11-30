import db from "@/lib/db/mysql";
import { getSelf } from "@/lib/auth-service";

export const getFollowedUsers = async () => {
  let query;

  try {
    const self = await getSelf();

    query = `
      SELECT u.*
      FROM User AS u
      JOIN Follow f on u.id = f.followingId
      LEFT JOIN Block b ON u.id = b.blockedId AND b.blockerId = ?
      WHERE f.followerId = ?
      AND b.blockedId IS NULL
    `;

    const [followedUsers] = await db.execute(query, [self.id, self.id]);

    return JSON.parse(JSON.stringify(followedUsers));
  } catch {
    return [];
  }
};

export const isFollowingUser = async (id: string) => {
  let query;

  try {
    const self = await getSelf();

    query = 'SELECT * FROM User WHERE id = ?';
    const fetchOtherUser = await db.execute(query, [id]);

    if (!fetchOtherUser) {
      throw new Error("User not found");
    }

    const [otherUser] = JSON.parse(JSON.stringify(fetchOtherUser))[0];

    if (otherUser.id === self.id) {
      return true;
    }

    query = 'SELECT * FROM follow WHERE followerId = ? AND followingId = ? LIMIT 1';

    const fetchExistingFollow = await db.execute(query, [self.id, otherUser.id]);

    const [existingFollow] = JSON.parse(JSON.stringify(fetchExistingFollow))[0];

    return !!existingFollow;
  } catch {
    return false;
  }
};

export const followUser = async (id: string) => {
  let query;

  const self = await getSelf();

  query = 'SELECT * FROM User WHERE id = ?';

  const fetchOtherUser = await db.execute(query, [id]);

  const [otherUser] = JSON.parse(JSON.stringify(fetchOtherUser))[0];

  if (!otherUser) {
    throw new Error("User not found");
  }

  if (otherUser.id === self.id) {
    throw new Error("Cannot follow yourself");
  }

  query = 'SELECT * from Follow where followerId = ? and followingId = ? LIMIT 1';

  const fetchExistingFollow = await db.execute(query, [self.id, otherUser.id]);

  const [existingFollow] = JSON.parse(JSON.stringify(fetchExistingFollow))[0];

  if (existingFollow) {
    throw new Error("Already following");
  }

  const insertQuery = `
      INSERT INTO Follow (followerId, followingId)
      VALUES (?, ?)
      `;
  await db.execute(insertQuery, [self.id, otherUser.id]);

  const selectQuery = `
    SELECT
        Follow.*,
        follower.*,
        following.*
    FROM
        Follow
    JOIN
        User AS follower ON Follow.followerId = follower.id
    JOIN
        User AS following ON Follow.followingId = following.id
    WHERE
        Follow.followerId = ? AND Follow.followingId = ?;
    `;

  const [follow] = await db.execute(selectQuery, [self.id, otherUser.id]);

  return JSON.parse(JSON.stringify(follow))[0];
};

export const unfollowUser = async (id: string) => {
  const self = await getSelf();
  let query;

  query = 'SELECT * FROM User WHERE id = ?';
  const [fetchOtherUser] = await db.execute(query, [id]);

  if (!fetchOtherUser) {
    throw new Error("User not found");
  }

  const [otherUser] = JSON.parse(JSON.stringify(fetchOtherUser));

  if (otherUser.ud === self.id) {
    throw new Error("Cannot unfollow yourself");
  }

  query = 'SELECT * FROM follow WHERE followerId = ? AND followingId = ? LIMIT 1';

  const [fetchExistingFollow] = await db.execute(query, [self.id, otherUser.id]);

  const [existingFollow] = JSON.parse(JSON.stringify(fetchExistingFollow));

  if (!existingFollow) {
    throw new Error("Not following");
  }

  query = 'DELETE FROM Follow WHERE id = ?';

  await db.execute(query, [existingFollow.id]);

  query = 'SELECT * FROM User WHERE id = ?';

  const [following] = await db.execute(query, [existingFollow.followingId]);

  return JSON.parse(JSON.stringify(following))[0];
};