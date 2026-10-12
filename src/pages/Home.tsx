import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Leaf,
  BarChart3,
  Coins,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Globe2,
  TreePine,
  CheckCircle2,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Next-Gen Ecological Decentralized Protocol
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
            Carbon Footprint <br />
            <span className="text-emerald-700 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Fuse & Blockchain Ledger
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Merging carbon footprint estimation with blockchain technology to create a sustainable future. Calculate verified emissions, earn tokenized carbon credits, and trade on the decentralized marketplace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/calculator" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20">
                Launch Carbon Calculator
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-emerald-500/30">
                {isAuthenticated ? 'Open Impact Dashboard' : 'Sign In with Email'}
              </Button>
            </Link>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verra & Gold Standard Compliant Math
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Polygon PoS Low-Energy Ledger
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              MetaMask Instant Integration
            </span>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-muted/40 border">
          <div className="text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">84,500+</div>
            <div className="text-xs text-muted-foreground">Metric Tons CO₂ Audited</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">42,000+</div>
            <div className="text-xs text-muted-foreground">CCT Minted & Traded</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">120+</div>
            <div className="text-xs text-muted-foreground">Global Partner Networks</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
            <div className="text-xs text-muted-foreground">Transparent Smart Ledger</div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="container mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            How EcoFuse Works
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A complete ecosystem bridging real-world climate actions with decentralized smart incentives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border hover:border-emerald-500/40 transition-all hover:shadow-lg">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">1. Comprehensive Audit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculate emission footprints across transportation, residential heating, renewable switches, waste diversion, and nutrition with sector-specific units.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-emerald-500/40 transition-all hover:shadow-lg">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">2. Earn & Trade CCT</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every verified emission reduction mints decentralized Carbon Credit Tokens directly into your connected wallet to spend on green rewards or sell on the open order book.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-emerald-500/40 transition-all hover:shadow-lg">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">3. Verifiable Consensus</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Immutable smart contracts ensure zero double-counting, permanent audit trails, and cryptographically verified partner ESG collaborations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Calculator Teaser Banner */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500/30">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to discover your carbon benchmark?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              It takes less than 2 minutes to calculate your annualized baseline, compare with national averages, and unlock initial reward tokens.
            </p>
          </div>

          <Link to="/calculator" className="shrink-0">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
              Start Multi-Step Calculator
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
