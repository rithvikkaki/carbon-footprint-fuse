import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
          <Leaf className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-foreground">404</h1>
          <h2 className="text-xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page you are looking for doesn't exist, has been retired, or moved to another link.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
              <Home className="w-4 h-4 mr-1.5" />
              Return Home
            </Button>
          </Link>
          <Link to="/calculator">
            <Button variant="outline" className="text-xs">
              Go to Calculator
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
