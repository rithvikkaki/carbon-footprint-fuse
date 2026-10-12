import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Button } from '@/components/ui/button';
import {
  Leaf,
  Coins,
  Wallet,
  Menu,
  X,
  User,
  LogOut,
  BarChart3,
  Globe,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { credits, walletConnected, walletAddress } = useCarbonFootprint();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="eco-gradient-bg py-3 px-4 shadow-sm sticky top-0 z-40 w-full backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-2 sm:px-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-eco-dark dark:text-emerald-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="tracking-tight font-extrabold text-gray-900 dark:text-white">
            Carbon <span className="text-emerald-700 dark:text-emerald-400">Footprint Fuse</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/calculator"
            className={`transition-colors hover:text-emerald-600 ${
              isActive('/calculator') ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'
            }`}
          >
            Calculator
          </Link>
          <Link
            to="/marketplace"
            className={`transition-colors hover:text-emerald-600 ${
              isActive('/marketplace') ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'
            }`}
          >
            Marketplace
          </Link>
          <Link
            to="/blockchain"
            className={`transition-colors hover:text-emerald-600 ${
              isActive('/blockchain') ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'
            }`}
          >
            Blockchain
          </Link>
          <Link
            to="/about"
            className={`transition-colors hover:text-emerald-600 ${
              isActive('/about') ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'
            }`}
          >
            About & Team
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`transition-colors hover:text-emerald-600 ${
                isActive('/dashboard') ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Credits counter */}
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
              >
                <Coins className="h-4 w-4 text-emerald-600" />
                <span>{credits} CCT</span>
              </Link>

              {/* Wallet Pill */}
              <Link
                to="/connect-wallet"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  walletConnected
                    ? 'border-emerald-500/40 bg-emerald-50/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-border hover:bg-accent text-muted-foreground'
                }`}
              >
                <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                <span>{walletConnected ? `${walletAddress.substring(0, 6)}...` : 'Connect Wallet'}</span>
              </Link>

              {/* Profile Link */}
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </Link>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive text-xs"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Coins className="h-3.5 w-3.5" />
              <span>{credits}</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3">
          <Link
            to="/calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium hover:text-emerald-600"
          >
            <BarChart3 className="h-4 w-4" />
            Calculator
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium hover:text-emerald-600"
          >
            <Globe className="h-4 w-4" />
            Marketplace
          </Link>
          <Link
            to="/blockchain"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium hover:text-emerald-600"
          >
            <ShieldCheck className="h-4 w-4" />
            Blockchain
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium hover:text-emerald-600"
          >
            <Info className="h-4 w-4" />
            About Team
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium hover:text-emerald-600"
              >
                <Leaf className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium hover:text-emerald-600"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/connect-wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium hover:text-emerald-600"
              >
                <Wallet className="h-4 w-4" />
                {walletConnected ? 'Wallet Connected' : 'Connect MetaMask'}
              </Link>
              <Button
                variant="outline"
                className="w-full text-destructive"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-emerald-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
