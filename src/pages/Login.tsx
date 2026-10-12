import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, LogOut, ArrowRight, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Login: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Signed in successfully!',
        description: `Welcome back, ${email}!`,
      });
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: 'Sign in failed',
        description: 'Please check your email credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in, show logout or go to dashboard
  if (isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full border-border text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-2">
              <Leaf className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold">Already Signed In</CardTitle>
            <CardDescription className="text-xs">
              You are currently authenticated as <strong>{user?.email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={() => {
                logout();
                toast({
                  title: 'Logged Out',
                  description: 'You have signed out of your EcoFuse account.',
                });
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out of This Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[75vh]">
      <Card className="max-w-md w-full border-border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-2">
            <Leaf className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Sign In to EcoFuse</CardTitle>
          <CardDescription className="text-xs">
            Access your carbon credits portfolio, footprint audits, and smart rewards.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
                <span className="text-[11px] text-emerald-600 hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 shadow-sm"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                login('rithvik@ecofuse.network');
                toast({
                  title: 'Demo Sign In',
                  description: 'Logged in as Rithvik (EcoFuse Lead).',
                });
                navigate('/dashboard');
              }}
              className="w-full text-xs h-9 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/50"
            >
              ⚡ Quick Demo Sign-In (1-Click)
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground border-t pt-4">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
