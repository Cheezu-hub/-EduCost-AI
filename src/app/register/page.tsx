"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInputs";

type FieldErrors = { name?: string; email?: string; password?: string; confirm?: string };

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, user } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Min 8 characters";
    else if (!/[A-Z]/.test(password)) errs.password = "Must include an uppercase letter";
    else if (!/[0-9]/.test(password)) errs.password = "Must include a number";
    if (password && confirm !== password) errs.confirm = "Passwords don't match";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    try {
      await register(name.trim(), email, password);
      router.push("/");
    } catch {
      // error shown via store
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0121 21H3a12.083 12.083 0 012.84-10.422L12 14z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create your account</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Free forever. No credit card required.
          </p>
        </div>

        <Card className="shadow-2xl shadow-blue-500/5">
          <CardHeader className="bg-gray-50/50 py-6 text-center border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Create Account</p>
          </CardHeader>
          <CardContent className="py-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <FormInput
                id="reg-name"
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
                helpText={fieldErrors.name}
                placeholder="Jane Smith"
              />

              <FormInput
                id="reg-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                helpText={fieldErrors.email}
                placeholder="you@example.com"
              />

              <FormInput
                id="reg-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                helpText={fieldErrors.password}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
              />

              <FormInput
                id="reg-confirm"
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setFieldErrors((p) => ({ ...p, confirm: undefined })); }}
                helpText={fieldErrors.confirm}
                placeholder="Repeat your password"
              />

              <Button
                type="submit"
                className="w-full shadow-xl shadow-blue-500/20 mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account…" : "Create Account →"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          By registering, you agree to our privacy policy. 🔒
        </p>
      </div>
    </div>
  );
}
