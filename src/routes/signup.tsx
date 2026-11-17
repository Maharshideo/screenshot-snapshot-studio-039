import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/canteeno/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Canteeno" },
      { name: "description", content: "Sign up with your campus email to order ahead from every canteen." },
      { property: "og:title", content: "Create account — Canteeno" },
      { property: "og:description", content: "Sign up to order ahead from every campus canteen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(60),
    email: z.string().trim().email("Enter a valid email").max(120),
    rollNo: z.string().trim().min(4, "Enter your roll number").max(20),
    phone: z.string().trim().regex(/^[+\d\s-]{10,16}$/, "Enter a valid phone number"),
    hostel: z.string().trim().max(40).optional().default(""),
    password: z.string().min(6, "At least 6 characters").max(64),
    confirm: z.string(),
    agree: z.literal(true, { errorMap: () => ({ message: "Please accept to continue" }) }),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

type FormValues = z.input<typeof signupSchema>;

function SignupPage() {
  const navigate = useNavigate();
  const signup = useApp((s) => s.signupStudent);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", rollNo: "", phone: "", hostel: "", password: "", confirm: "", agree: false as unknown as true },
  });

  const field = (id: keyof FormValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="mt-1.5" aria-invalid={!!errors[id]} {...props} {...register(id)} />
      {errors[id] && <p className="mt-1 text-xs text-destructive">{String(errors[id]?.message)}</p>}
    </div>
  );

  return (
    <AuthShell>
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-1 text-muted-foreground">Order ahead from every campus canteen.</p>
      <form
        noValidate
        className="mt-6 space-y-4"
        onSubmit={handleSubmit((v) => {
          setServerError(null);
          const r = signup({ name: v.name, email: v.email, rollNo: v.rollNo, phone: v.phone, hostel: v.hostel ?? "", password: v.password });
          if (!r.ok) return setServerError(r.error);
          toast.success(`Welcome to Canteeno, ${v.name.split(" ")[0]}!`);
          navigate({ to: "/" });
        })}
      >
        {field("name", "Full name", { autoComplete: "name", placeholder: "Aarav Sharma" })}
        {field("email", "Campus email", { type: "email", autoComplete: "email", placeholder: "you@campus.edu" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("rollNo", "Roll number", { placeholder: "22CS1042" })}
          {field("phone", "Phone", { type: "tel", autoComplete: "tel", placeholder: "+91 98xxxxxxx" })}
        </div>
        {field("hostel", "Hostel (optional)", { placeholder: "Hostel A" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("password", "Password", { type: "password", autoComplete: "new-password" })}
          {field("confirm", "Confirm password", { type: "password", autoComplete: "new-password" })}
        </div>
        <div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={!!watch("agree")} onCheckedChange={(c) => setValue("agree", (c === true) as true, { shouldValidate: true })} className="mt-0.5" />
            <span>I understand this is a prototype and my details stay in this browser only.</span>
          </label>
          {errors.agree && <p className="mt-1 text-xs text-destructive">{errors.agree.message}</p>}
        </div>
        {serverError && <p role="alert" className="rounded-xl bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">{serverError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>Create account</Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
