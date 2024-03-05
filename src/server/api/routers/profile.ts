import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = (
        await clerkClient.users.getUserList({
          username: [input.username],
        })
      ).map(filterUserForClient);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return user;
    }),
});
