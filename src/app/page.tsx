import { auth } from "~/server/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Drexfy <span className="text-[hsl(280,100%,70%)]">Certification</span>
        </h1>

        <div className="flex flex-col items-center gap-2">
          {session?.user ? (
            <div className="flex flex-col items-center">
              <p className="text-2xl">
                Welcome back, {session.user.email}!
              </p>
              <a
                href="/api/auth/signout"
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                Sign out
              </a>
            </div>
          ) : (
            <a
              href="/api/auth/signin"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
