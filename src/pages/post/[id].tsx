import type { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { Layout } from "~/components/Layout";
import { Loading } from "~/components/loading";
import { PostView } from "~/components/PostView";
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id as string;

  if (typeof id !== "string") {
    throw new Error("Invalid post id");
  }

  const helper = generateSSGHelper();

  await helper.post.getById.prefetch({
    id,
  });

  return {
    props: {
      trpcState: helper.dehydrate(),
      id,
    },
  };
};

type PageProps = {
  id: string;
};

export default function SinglePostPage({ id }: PageProps) {
  const { data, isLoading } = api.post.getById.useQuery({
    id,
  });

  const userState = isLoading ? "loading" : data ? "loaded" : "error";

  if (userState === "loading") return <Loading />;

  if (userState === "error") return <div>Error</div>;

  return (
    <>
      <Head>
        <title>
          {data?.author.username} - {data?.post.content}
        </title>
      </Head>
      <Layout>
        {data && <PostView post={data.post} author={data.author} />}
      </Layout>
    </>
  );
}
