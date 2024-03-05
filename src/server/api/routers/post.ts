import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { z } from "zod";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    const users = (
      await clerkClient.users.getUserList({
        limit: 100,
        userId: posts.map((post) => post.authorId),
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId)!;
      return {
        post,
        author: {
          ...author,
          username: author.username!,
        },
      };
    });
  }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed.").min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await ratelimit.limit(ctx.currentUserId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are doing that too much.",
        });
      }

      return ctx.db.post.create({
        data: {
          authorId: ctx.currentUserId,
          content: input.content,
        },
      });
    }),
});
