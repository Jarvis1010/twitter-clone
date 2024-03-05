import { appRouter } from "~/server/api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { db } from "~/server/db";
import superjson from "superjson";

export function generateSSGHelper() {
  return createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUserId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
}
