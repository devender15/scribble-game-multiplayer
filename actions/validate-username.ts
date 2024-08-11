"use server";

import { db } from "@/lib/db";

export default async function validateUsername(username: string) {
  const user = await db.user.findUnique({
    where: {
      name: username,
    },
  });

  if (user) {
    throw new Error("username already taken");
  }

  return username;
}
