'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const { login, signup, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
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
    } else {
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

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Leaf className="h-7 w-7" />
        </div>
        <span className="font-heading text-3xl font-bold tracking-tight text-primary">
          Nature Nook
        </span>
      </Link>
      
      <div className="glass w-full max-w-md rounded-3xl p-8 border border-border/50 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? 'Enter your credentials to access your account.' 
              : 'Sign up to safely adopt exotic companions.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="h-12 rounded-xl bg-white/50" 
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
              className="h-12 rounded-xl bg-white/50" 
              placeholder="you@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input 
              required 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="h-12 rounded-xl bg-white/50" 
              placeholder="••••••••"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-xl shadow-md mt-6"
          >
            {isLoading ? 'Processing...' : (isLogin ? (
              <><LogIn className="h-5 w-5 mr-2" /> Sign In</>
            ) : (
              <><UserPlus className="h-5 w-5 mr-2" /> Create Account</>
            ))}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 text-xs text-muted-foreground text-center">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>Admin: admin@naturenook.com / admin123</p>
          <p>User: user@naturenook.com / user123</p>
        </div>
      </div>
    </div>
  );
}
