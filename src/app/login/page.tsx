"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInputs";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    try {
      await login(email, password);
      router.push("/");
    } catch {
      // error shown via store
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0121 21H3a12.083 12.083 0 012.84-10.422L12 14z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Sign in to access your financial plans and saved reports.
          </p>
        </div>

        <Card className="shadow-2xl shadow-blue-500/5">
          <CardHeader className="bg-gray-50/50 py-6 text-center border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Secure Login</p>
          </CardHeader>
          <CardContent className="py-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <FormInput
                id="login-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                helpText={fieldErrors.email}
                placeholder="you@example.com"
              />

              <FormInput
                id="login-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                helpText={fieldErrors.password}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                className="w-full shadow-xl shadow-blue-500/20 mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign In →"}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-bold">Or try the demo</span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full border-2 border-blue-50 hover:border-blue-100 bg-blue-50/30 text-blue-700"
                onClick={async () => {
                  setEmail("demo@educost.ai");
                  setPassword("Student@1234");
                }}
              >
                Sign in as Demo Student
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 font-bold hover:underline">
                  Create one free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your data is encrypted and never sold. 🔒
        </p>
      </div>
    </div>
  );
}
