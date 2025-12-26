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

const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Account created successfully");
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
      console.error("Sign up error:", error);
      toast.error("Sign up failed. Please check your connection and try again.");
    }
  };

  const handleSwitchToSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <AuthPageLayout subtitle="Create your account to get started" title="Get Started">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              autoComplete="name"
              disabled={isSubmitting}
              id="name"
              placeholder="Your name"
              type="text"
              {...register("name")}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

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
              autoComplete="new-password"
              disabled={isSubmitting}
              id="password"
              placeholder="Choose a password"
              type="password"
              {...register("password")}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              autoComplete="new-password"
              disabled={isSubmitting}
              id="confirmPassword"
              placeholder="Confirm your password"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button onClick={handleSwitchToSignIn} variant="link">
            Already have an account? Sign In
          </Button>
        </div>
      </div>
    </AuthPageLayout>
  );
}
