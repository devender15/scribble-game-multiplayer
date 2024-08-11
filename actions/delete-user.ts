"use server";

import { db } from "@/lib/db";

export default async function deleteUser({ username }: { username: string }) {
  const user = await db.user.findUnique({
    where: { name: username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await db.user.delete({
    where: { name: username },
  });

  return { message: "User deleted successfully" };
}
