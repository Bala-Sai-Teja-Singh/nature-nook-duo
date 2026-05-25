'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

type PageView = 'login' | 'signup' | 'forgot' | 'otp' | 'newPassword';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}

const PasswordInput = ({
  value,
  onChange,
  show,
  onToggle,
  placeholder = '••••••••',
  ...props
}: PasswordInputProps) => (
  <div className="relative">
    <Input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      className="h-12 rounded-xl bg-background/50 pr-12"
      placeholder={placeholder}
      {...props}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
      tabIndex={-1}
    >
      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  </div>
);

export default function LoginPage() {
  const [view, setView] = useState<PageView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { login, signup, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(4, score);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (view === 'login') {
      const res = await login(email, password);
      if (res.success) {
        toast({ title: 'Welcome back!', variant: 'success' });
        if (res.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/shop');
        }
      } else {
        toast({ title: 'Login failed', description: res.error, variant: 'error' });
      }
    } else if (view === 'signup') {
      const res = await signup(name, email, password);
      if (res.success) {
        toast({ title: 'Account created!', variant: 'success' });
        if (res.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/shop');
        }
      } else {
        toast({ title: 'Signup failed', description: res.error, variant: 'error' });
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Code sent!', description: 'Check your email for the reset code.', variant: 'success' });
        setView('otp');
      } else {
        toast({ title: 'Error', description: data.error, variant: 'error' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'error' });
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Password reset!', description: 'You can now sign in with your new password.', variant: 'success' });
        setView('login');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setResetEmail('');
      } else {
        toast({ title: 'Error', description: data.error, variant: 'error' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
      case 'otp': return 'Enter Reset Code';
      case 'newPassword': return 'New Password';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login': return 'Enter your credentials to access your account.';
      case 'signup': return 'Sign up to safely adopt exotic companions.';
      case 'forgot': return 'Enter your email and we\'ll send you a reset code.';
      case 'otp': return `We sent a 6-digit code to ${resetEmail}`;
      case 'newPassword': return 'Choose a strong new password for your account.';
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-brand-primary-light/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-80 h-80 bg-brand-accent/20 rounded-full blur-3xl opacity-50" />

      <div className="glass w-full max-w-5xl rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl flex relative z-10 min-h-[600px] animate-hero-text">

        {/* Left Side: Illustration */}
        <div className="hidden lg:flex flex-col flex-1 relative bg-primary/5 p-12 justify-between">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            {/* Can use a background image here in future if added to public folder */}
            <div className="absolute inset-0 bg-nature-pattern" />
          </div>
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-12 w-fit group">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Leaf className="h-7 w-7 animate-gentle-bounce" />
              </div>
              <span className="font-heading text-3xl font-bold tracking-tight text-primary">
                Nature's Nook Duo
              </span>
            </Link>
            <h1 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-accent pb-1 mb-4">
              Join the Exotic Pet Community
            </h1>
            <p className="text-muted-foreground max-w-sm">
              Discover unique companions, expertly crafted enclosures, and the care guides you need to thrive together.
            </p>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="flex -space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-background bg-blue-100 dark:bg-blue-900 flex items-center justify-center"><UserPlus className="h-5 w-5 text-blue-500" /></div>
              <div className="w-10 h-10 rounded-full border-2 border-background bg-green-100 dark:bg-green-900 flex items-center justify-center"><Leaf className="h-5 w-5 text-green-500" /></div>
              <div className="w-10 h-10 rounded-full border-2 border-background bg-amber-100 dark:bg-amber-900 flex items-center justify-center"><KeyRound className="h-5 w-5 text-amber-500" /></div>
              <div className="w-10 h-10 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">+500</div>
            </div>
            <p className="text-sm font-medium text-foreground">Trusted by exotic pet lovers worldwide.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-12 lg:max-w-lg w-full flex flex-col justify-center bg-background/50 backdrop-blur-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 w-fit group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-primary">
                Nature's Nook Duo
              </span>
            </Link>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="font-heading text-3xl font-bold mb-2 transition-all duration-300">{getTitle()}</h2>
            <p className="text-muted-foreground text-sm transition-all duration-300">{getSubtitle()}</p>
          </div>

          {/* Login / Signup Form */}
          {(view === 'login' || view === 'signup') && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="h-12 rounded-xl bg-background/50"
                      placeholder="John Doe"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-background/50"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <PasswordInput
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    show={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                  {view === 'signup' && password.length > 0 && (
                    <div className="pt-1">
                      <div className="flex h-1 gap-1 w-full mt-2">
                        {[1, 2, 3, 4].map(idx => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= idx
                              ? passwordStrength <= 2 ? 'bg-amber-500' : 'bg-green-500'
                              : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">
                        {passwordStrength <= 2 ? 'Weak password' : passwordStrength === 3 ? 'Good password' : 'Strong password'}
                      </p>
                    </div>
                  )}
                </div>

                {view === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setResetEmail(email); }}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl shadow-md mt-2"
                >
                  {isLoading ? 'Processing...' : (view === 'login' ? (
                    <><LogIn className="h-5 w-5 mr-2" /> Sign In</>
                  ) : (
                    <><UserPlus className="h-5 w-5 mr-2" /> Create Account</>
                  ))}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                    className="text-primary font-medium hover:underline"
                  >
                    {view === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 text-xs text-muted-foreground text-center">
                <p className="font-medium mb-1">Demo Credentials:</p>
                <p>Admin: admin@naturenook.com / admin123</p>
                <p>User: user@naturenook.com / user123</p>
              </div>
            </>
          )}

          {/* Forgot Password — Enter Email */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Input
                    required
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="h-12 rounded-xl bg-background/50 pl-12"
                    placeholder="you@example.com"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <Button type="submit" disabled={resetLoading} className="w-full h-12 rounded-xl shadow-md">
                {resetLoading ? 'Sending...' : 'Send Reset Code'}
              </Button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </button>
            </form>
          )}

          {/* OTP Verification + New Password */}
          {view === 'otp' && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reset Code</label>
                <div className="relative">
                  <Input
                    required
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-12 rounded-xl bg-background/50 pl-12 text-center text-lg tracking-[0.5em] font-mono"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <PasswordInput
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  show={showNewPassword}
                  onToggle={() => setShowNewPassword(!showNewPassword)}
                  placeholder="Min. 6 characters"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <PasswordInput
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  placeholder="Re-enter password"
                />
              </div>

              <Button type="submit" disabled={resetLoading || otp.length !== 6} className="w-full h-12 rounded-xl shadow-md mt-2">
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <div className="text-center text-sm space-y-2 mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword as unknown as React.MouseEventHandler}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Resend Code
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
