import Head from "next/head";

export default function PostPage() {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex justify-center">
        <div className="h-screen w-full border-x border-slate-400 md:max-w-2xl">
          Post View
        </div>
      </main>
    </>
  );
}