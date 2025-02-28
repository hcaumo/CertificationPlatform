import { type NextPage } from "next";

const ErrorPage: NextPage = async () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="w-full max-w-md rounded-lg bg-white/10 p-8 backdrop-blur-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-red-400">
          Authentication Error
        </h2>
        <p className="text-center text-gray-200">
          An error occurred during authentication. Please try again.
        </p>
        <div className="mt-6 text-center">
          <a
            href="/auth/signin"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;