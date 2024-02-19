import { Prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { type User } from "next-auth";

export const usersRouter = {
  /**
   * Get all of the users in the database -- excludes sensitive information
   *
   * @returns The users
   */
  getAllUsersSecure: publicProcedure.mutation(async () => {
    const users = await Prisma.getAllUsers({
      id: true,
      name: true,
      email: true,
      image: true,
      permissions: true,
      roles: true,
      password: false,
      secret: false,
    });

    return { success: true, users: users as User[] };
  }),
};
