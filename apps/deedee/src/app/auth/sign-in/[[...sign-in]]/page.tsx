"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@starter-saas/ui/button";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { authClient } from "@/lib/auth/client";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign in successful");
          },
          onError: (error) => {
            const message =
              error.error?.message ||
              error.error?.statusText ||
              "An unexpected error occurred. Please try again.";
            toast.error(message);
          },
        },
      );
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Sign in failed. Please check your connection and try again.");
    }
  };

  const handleSwitchToSignUp = () => {
    router.push("/auth/sign-up");
  };

  return (
    <AuthPageLayout subtitle="Sign in to your account" title="Welcome Back">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              disabled={isSubmitting}
              id="email"
              placeholder="you@example.com"
              type="email"
              {...register("email")}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete="current-password"
              disabled={isSubmitting}
              id="password"
              placeholder="Enter your password"
              type="password"
              {...register("password")}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button onClick={handleSwitchToSignUp} variant="link">
            Need an account? Sign Up
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
}
