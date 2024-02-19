import { Prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";

export const usersRouter = {
  /**
   * Get all of the users in the database -- excludes sensitive information
   *
   * @returns The users
   */
  getAllUsersSecure: publicProcedure.mutation(async () => {
    const users = await Prisma.getAllUsersSecure();

    return { success: true, users };
  }),
};
