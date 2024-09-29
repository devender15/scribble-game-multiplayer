"use server";

import { db } from "@/lib/db";

export default async function deleteUser(name: string) {
  const user = await db.user.findUnique({
    where: { name },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await db.user.delete({
    where: { name },
  });

  return { message: "User deleted successfully" };
}
