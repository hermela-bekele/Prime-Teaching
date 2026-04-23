import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold">PRIME EduAI</h1>
        <p className="mt-2 text-slate-600">Choose a route to explore the app shell.</p>
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        <Link className="text-slate-900 underline" href="/login">
          Login
        </Link>
        <Link className="text-slate-900 underline" href="/register">
          Register
        </Link>
        <Link className="text-slate-900 underline" href="/teacher">
          Teacher dashboard
        </Link>
        <Link className="text-slate-900 underline" href="/department-head">
          Department head dashboard
        </Link>
        <Link className="text-slate-900 underline" href="/school-leader">
          School leader dashboard
        </Link>
      </nav>
    </main>
  );
}
