import type { PropsWithChildren } from "react";

export function Layout({ children }: PropsWithChildren) {
  return (
    <main className="flex justify-center">
      <div className="h-screen w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
        {children}
      </div>
    </main>
  );
}
