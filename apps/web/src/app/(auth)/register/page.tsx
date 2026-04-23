import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">Registration flow placeholder.</p>
      </div>
      <form className="flex flex-col gap-3">
        <input className="rounded border border-slate-200 px-3 py-2" type="email" placeholder="Email" />
        <input className="rounded border border-slate-200 px-3 py-2" type="password" placeholder="Password" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
          Register
        </button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-medium text-slate-900 underline" href="/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}
