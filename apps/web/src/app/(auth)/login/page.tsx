"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { asAppRoute } from "@/lib/navigation";
import { dashboardPathForRole } from "@/lib/roles";
import { extractAccessToken, fetchMe, getApiErrorMessage, loginRequest } from "@/lib/api-client";
import { mapAuthUserDto } from "@/lib/user-mapper";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await loginRequest(values);
      const token = extractAccessToken(res);
      if (!token) {
        toast.error("Login response did not include a token.");
        return;
      }
      useAuthStore.getState().setToken(token);
      const me = await fetchMe();
      const user = mapAuthUserDto(me);
      useAuthStore.getState().setAuth(token, user);
      toast.success("Signed in");
      router.replace(asAppRoute(dashboardPathForRole(user.role)));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-blue-800">PRIME Teaching</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in with your school account to open your role workspace.</p>
      </div>

      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-xs text-rose-600">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-xs text-rose-600">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button className="w-full bg-blue-700 hover:bg-blue-800" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600">
        No account?{" "}
        <Link className="font-medium text-blue-800 underline" href="/register">
          Register
        </Link>
      </p>
    </main>
  );
}
