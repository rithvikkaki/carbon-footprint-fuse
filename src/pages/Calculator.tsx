import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CarbonCalculator } from '@/components/calculator/CarbonCalculator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, Leaf, ArrowRight } from 'lucide-react';

export const Calculator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <Card className="max-w-md w-full border-border text-center shadow-lg">
          <CardHeader className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-1">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold">Authentication Required</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Please sign in to access the multi-step Carbon Footprint Calculator. Your results and earned CCT tokens will be credited directly to your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            <Link to="/login">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Sign In to Start
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link to="/register">
              <Button variant="outline" className="w-full">
                Create Free Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Decentralized Carbon Calculator
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Step-by-step verified accounting calibrated to international greenhouse gas protocols.
        </p>
      </div>

      <CarbonCalculator />
    </div>
  );
};

export default Calculator;
