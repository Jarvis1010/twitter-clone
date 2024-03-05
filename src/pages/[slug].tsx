import type { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { Layout } from "~/components/Layout";
import { Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { db } from "~/server/db";
import superjson from "superjson";

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUserId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug as string;

  if (typeof slug !== "string") {
    throw new Error("Invalid slug");
  }

  const username = slug.replace(/@/, "");

  await helpers.profile.getUserByUsername.prefetch({
    username,
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

type PageProps = {
  username: string;
};

export default function ProfilePage({ username }: PageProps) {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  const userState = isLoading ? "loading" : data ? "loaded" : "error";

  if (userState === "loading") return <Loading />;

  if (userState === "error") return <div>Error</div>;

  return (
    <>
      <Head>
        <title>{data?.username}</title>
      </Head>
      <Layout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data?.imageUrl}
            alt={data?.username}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">@{data?.username}</div>
        <div className="w-full border-b border-slate-400" />
      </Layout>
    </>
  );
}
