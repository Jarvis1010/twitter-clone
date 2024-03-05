import { type RouterOutputs, api } from "~/utils/api";
import { SignInButton, useUser } from "@clerk/nextjs";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Loading, LoadingSpinner } from "~/components/loading";
import { useRef } from "react";
import toast from "react-hot-toast";
import { Layout } from "~/components/Layout";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

function PostView({ post, author }: PostWithUser) {
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
        src={author.imageUrl}
        alt={author.username}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>@{author.username}</span>
          </Link>
          <span>·</span>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
}

function CreatePostWizard() {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const utils = api.useUtils();

  const { mutate, isLoading } = api.post.create.useMutation({
    onSuccess: async () => {
      formRef.current?.reset();
      void utils.invalidate();
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors?.content;
      toast.error(errorMessage?.[0] ?? "Failed to create post");
    },
  });

  if (!user) return null;

  const postingState = isLoading ? "loading" : "idle";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;
    if (!content) return;

    mutate({ content });
  };

  return (
    <form ref={formRef} className="flex w-full gap-3" onSubmit={handleSubmit}>
      <Image
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
        src={user.imageUrl}
        alt={user.username ?? ""}
      />
      <input
        name="content"
        placeholder="What's on your mind?"
        className="grow bg-transparent outline-none"
        disabled={isLoading}
      />
      {postingState === "idle" ? (
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
          disabled={isLoading}
        >
          Post
        </button>
      ) : (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </form>
  );
}

function Feed() {
  const { data, isLoading: isPostsLoading } = api.post.getAll.useQuery();
  const postState = isPostsLoading ? "loading" : "loaded";

  if (postState === "loading") return <Loading />;

  if (!data) return <div>Error</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
}

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  //prefetching the post data
  api.post.getAll.useQuery();

  const userState = isLoaded
    ? isSignedIn
      ? "signed-in"
      : "signed-out"
    : "loading";

  // return empty div if user or post is loading, since  user tends to load faster than post
  if (userState === "loading") return <div />;

  return (
    <>
      <Head>
        <title>Twitter Clone</title>
        <meta name="description" content="🤔" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="border-b border-slate-400 p-4">
          {userState === "signed-in" ? <CreatePostWizard /> : <SignInButton />}
        </div>
        <Feed />
      </Layout>
    </>
  );
}
