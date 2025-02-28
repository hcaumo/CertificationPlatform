import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // If the user is authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }
  
  // Otherwise, show the landing page with a sign-in option
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Drexfy <span className="text-[hsl(280,100%,70%)]">Certification</span>
        </h1>
        <p className="text-2xl text-center">
          Start your learning journey and get certified today!
        </p>
        <div className="flex flex-col items-center gap-2">
          <a
            href="/auth/signin"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}