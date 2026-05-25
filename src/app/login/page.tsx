'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 group animate-hero-text">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Leaf className="h-7 w-7 animate-gentle-bounce" />
        </div>
        <span className="font-heading text-3xl font-bold tracking-tight text-primary">
          Nature&apos;s Nook Duo
        </span>
      </Link>
      
      <div className="glass w-full max-w-md rounded-3xl p-8 border border-border/50 shadow-xl animate-hero-text animate-hero-text-delay-1">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2 transition-all duration-300">{getTitle()}</h1>
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
  );
}
