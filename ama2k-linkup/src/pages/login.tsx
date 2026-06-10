import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Flame, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Check your email to confirm your account, then log in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/discover");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Hero gradient top */}
      <div className="relative h-64 bg-gradient-to-br from-primary via-primary/80 to-accent flex flex-col items-center justify-end pb-8 shrink-0">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/4 -translate-x-1/4" />

        <div className="relative flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
            <Flame className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">AMA2K LinkUp</h1>
            <p className="text-white/70 text-sm mt-1">Zimbabwe's social connection app</p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-6 relative z-10 pb-8">
        <div className="bg-card border border-card-border rounded-3xl shadow-xl p-6">
          {/* Tab toggle */}
          <div className="flex bg-muted rounded-2xl p-1 mb-6">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                data-testid={`tab-${m}`}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
                  mode === m
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="rounded-xl h-12 bg-muted border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  required
                  minLength={6}
                  className="rounded-xl h-12 bg-muted border-0 focus-visible:ring-2 focus-visible:ring-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div data-testid="auth-error" className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div data-testid="auth-success" className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm rounded-xl px-4 py-3">
                {success}
              </div>
            )}

            <Button
              data-testid="button-submit"
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {mode === "login" && (
            <button
              data-testid="link-forgot-password"
              onClick={async () => {
                if (!email) { setError("Enter your email first"); return; }
                setLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                setLoading(false);
                if (error) setError(error.message);
                else setSuccess("Password reset email sent.");
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
            >
              Forgot password?
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
