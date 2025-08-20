import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  LogIn,
  Eye,
  EyeOff,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof signInSchema>;

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote:
        "TechTube has become my go-to platform for sharing programming tutorials. The community engagement is incredible and the analytics help me create better content.",
      author: "Sofia Davis",
      role: "YouTube Tech Educator",
      initials: "SD",
    },
    {
      quote:
        "The platform's intuitive design and powerful features have helped me grow my developer audience by 300% in just 6 months.",
      author: "Marcus Chen",
      role: "Senior Developer at Meta",
      initials: "MC",
    },
    {
      quote:
        "Finally, a platform built specifically for tech content creators. The community tools and analytics are game-changing.",
      author: "Sarah Johnson",
      role: "DevOps Engineer",
      initials: "SJ",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    setAuthError("");

    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            router.navigate({ to: "/" });
          },
          onError: (error) => {
            setAuthError(error.error.message || "Invalid email or password");
          },
        }
      );
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto relative min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <aside
        className="relative hidden h-full flex-col bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-900 dark:to-slate-800 p-12 text-slate-800 dark:text-white lg:flex border-r border-border overflow-hidden"
        aria-label="TechTube branding and platform information"
        role="complementary"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/8 via-orange-600/6 to-red-600/4 dark:from-red-600/6 dark:to-orange-600/4" />
        <div className="absolute top-32 right-32 h-48 w-48 rounded-full bg-gradient-to-br from-red-400/15 to-orange-400/10 dark:from-red-400/12 dark:to-orange-400/8 blur-2xl animate-pulse" />
        <div className="absolute bottom-32 left-32 h-32 w-32 rounded-full bg-gradient-to-br from-orange-400/10 to-red-400/8 dark:from-orange-400/8 dark:to-red-400/6 blur-xl" />

        <header className="relative z-20 flex items-center text-xl font-semibold">
          <div
            className="mr-4 rounded-xl bg-gradient-to-br from-red-500/25 to-orange-500/20 p-3 backdrop-blur-sm border border-red-200/30 dark:border-white/20 shadow-lg"
            aria-hidden="true"
          >
            <LogIn className="h-6 w-6 text-red-600 dark:text-red-200" />
          </div>
          <h1 className="bg-gradient-to-r from-slate-800 via-red-700 to-orange-700 dark:from-white dark:via-red-50 dark:to-orange-50 bg-clip-text text-transparent font-bold">
            TechTube
          </h1>
        </header>

        <main className="relative z-20 flex-1 flex flex-col justify-center">
          <div className="space-y-8 text-center">
            <h2 className="text-4xl font-bold leading-tight bg-gradient-to-r from-slate-800 via-red-700 to-orange-700 dark:from-white dark:via-red-50 dark:to-orange-50 bg-clip-text text-transparent">
              Welcome back
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg opacity-75">
              Continue building amazing tech content
            </p>

            <div
              className="flex justify-center space-x-8 pt-8"
              role="region"
              aria-label="Platform statistics"
            >
              <div className="text-center">
                <div
                  className="text-2xl font-bold text-slate-800 dark:text-white"
                  aria-label="50,000 plus creators"
                >
                  50K+
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Creators
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold text-slate-800 dark:text-white"
                  aria-label="2 million plus videos"
                >
                  2M+
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Videos
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold text-slate-800 dark:text-white"
                  aria-label="98 percent user satisfaction"
                >
                  98%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Happy
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-20 mt-auto opacity-60">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Trusted by developers worldwide
            </p>
          </div>
        </footer>
      </aside>
      <div className="lg:p-8">
        <div className="mb-6 flex items-center justify-center space-x-6 text-xs text-muted-foreground lg:hidden">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>50K+ Users</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Growing Fast</span>
          </div>
        </div>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight animate-fadeInUp">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground animate-fadeInUp animation-delay-100">
              Enter your email below to sign in to your account
            </p>
          </div>
          <div className="grid gap-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  {authError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                      <p className="text-sm text-destructive">{authError}</p>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            type="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            to="/"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              disabled={isLoading}
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              disabled={isLoading}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-medium"
                  >
                    {isLoading && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    )}
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </Form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-muted-foreground/20 hover:border-muted-foreground/40"
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              to="/sign-up"
              className="underline underline-offset-4 hover:text-primary"
            >
              Don't have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
