import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold text-blue-700">404</h1>
      <p className="text-slate-600">This page does not exist.</p>
      <Link href="/" className="rounded bg-blue-700 px-4 py-2 text-sm text-white">
        Go home
      </Link>
    </main>
  );
}
