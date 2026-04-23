import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">Wire this form to NextAuth or your auth provider.</p>
      </div>
      <form className="flex flex-col gap-3">
        <input
          className="rounded border border-slate-200 px-3 py-2"
          type="email"
          placeholder="Email"
          autoComplete="email"
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
        />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
          Continue
        </button>
      </form>
      <p className="text-sm text-slate-600">
        No account?{" "}
        <Link className="font-medium text-slate-900 underline" href="/register">
          Register
        </Link>
      </p>
    </main>
  );
}
