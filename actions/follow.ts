"use server";

import { revalidatePath } from "next/cache";

import { followUser, unfollowUser } from "@/lib/follow-service";

export const onFollow = async (id: string) => {
  try {
    const followedUser = await followUser(id);

    revalidatePath("/");

    if (followedUser) {
      revalidatePath(`/${followedUser.following.username}`);
    }

    return followedUser;
  } catch (error) {
    console.log(error);
    // throw new Error("Internal Error");
  };
};

export const onUnfollow = async (id: string) => {
  try {
    const unfollowedUser = await unfollowUser(id);
    console.log("UNFOLLOWEDUSER:", unfollowedUser)
    revalidatePath("/");

    if (unfollowedUser) {
      revalidatePath(`/${unfollowedUser.username}`);
    }

    return unfollowedUser;
  } catch (error) {
    console.log(error)
    // throw new Error("Internal Error");
  }
}