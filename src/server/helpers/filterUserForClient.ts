import type { User } from "@clerk/nextjs/server";

export function filterUserForClient({ id, username, imageUrl }: User) {
  return {
    id,
    username,
    imageUrl,
  };
}
