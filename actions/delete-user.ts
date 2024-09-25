"use server";

import { db } from "@/lib/db";

export default async function deleteUser(name: string) {
  console.log(name);
  const user = await db.user.findUnique({
    where: { name },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await db.user.delete({
    where: { name },
  });

  console.log("success");

  return { message: "User deleted successfully" };
}
