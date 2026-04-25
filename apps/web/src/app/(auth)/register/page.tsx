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
import { extractAccessToken, fetchMe, getApiErrorMessage, registerRequest } from "@/lib/api-client";
import { mapAuthUserDto } from "@/lib/user-mapper";
import { useAuthStore } from "@/stores/authStore";

function hasAccessToken(res: unknown): res is { access_token?: string; token?: string } {
  return typeof res === "object" && res !== null && ("access_token" in res || "token" in res);
}

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email required"),
    school_name: z.string().min(2, "School name is required"),
    role: z.enum(["teacher", "department_head", "school_leader", "admin"]),
    department_name: z.string().optional(),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string().min(8, "Confirm your password")
  })
  .superRefine((d, ctx) => {
    if (d.role === "department_head" && !(d.department_name ?? "").trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["department_name"],
        message: "Department name is required for Department Head"
      });
    }
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      school_name: "",
      role: "teacher",
      department_name: "",
      password: "",
      confirm: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await registerRequest({
        email: values.email,
        password: values.password,
        name: values.name,
        role: values.role,
        department_name: values.department_name?.trim() || undefined,
        school_name: values.school_name
      });
      const token = hasAccessToken(res) ? extractAccessToken(res) : null;
      if (token) {
        useAuthStore.getState().setToken(token);
        const me = await fetchMe();
        const user = mapAuthUserDto(me);
        useAuthStore.getState().setAuth(token, user);
        toast.success("Account created");
        router.replace(asAppRoute(dashboardPathForRole(user.role)));
        return;
      }
      toast.success("Account created — please sign in.");
      router.replace(asAppRoute("/login"));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-800">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Join PRIME Teaching with your school email.</p>
      </div>

      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name && <p className="text-xs text-rose-600">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-xs text-rose-600">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="school_name">School name</Label>
          <Input id="school_name" {...form.register("school_name")} />
          {form.formState.errors.school_name && (
            <p className="text-xs text-rose-600">{form.formState.errors.school_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            {...form.register("role")}
          >
            <option value="teacher">Teacher</option>
            <option value="department_head">Department Head</option>
            <option value="school_leader">School Leader</option>
            <option value="admin">Admin</option>
          </select>
          {form.formState.errors.role && <p className="text-xs text-rose-600">{form.formState.errors.role.message}</p>}
        </div>
        {form.watch("role") === "department_head" ? (
          <div className="space-y-2">
            <Label htmlFor="department_name">Department name</Label>
            <Input id="department_name" {...form.register("department_name")} />
            {form.formState.errors.department_name && (
              <p className="text-xs text-rose-600">{form.formState.errors.department_name.message}</p>
            )}
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-xs text-rose-600">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" autoComplete="new-password" {...form.register("confirm")} />
          {form.formState.errors.confirm && (
            <p className="text-xs text-rose-600">{form.formState.errors.confirm.message}</p>
          )}
        </div>
        <Button className="w-full bg-blue-700 hover:bg-blue-800" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account…" : "Register"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-medium text-blue-800 underline" href="/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}
