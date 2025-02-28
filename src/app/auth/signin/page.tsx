import { signIn, getCsrfToken } from "next-auth/react";
import { type FormEvent } from "react";

export default async function SignInPage() {
  const csrfToken = await getCsrfToken();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    await signIn("email", {
      email,
      callbackUrl: "/",
      csrfToken,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="w-full max-w-md rounded-lg bg-white/10 p-8 backdrop-blur-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-600 bg-white/5 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign in with Email
          </button>
        </form>
      </div>
    </div>
  );
}