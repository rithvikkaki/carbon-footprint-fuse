import React, { useState } from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CarbonCreditTradingSection } from '@/components/marketplace/CarbonCreditTradingSection';
import { SustainableProductsSection } from '@/components/marketplace/SustainableProductsSection';
import { MarketplaceRewardsSection } from '@/components/marketplace/MarketplaceRewardsSection';
import { MarketplaceCollaborationsSection } from '@/components/marketplace/MarketplaceCollaborationsSection';
import { MarketplaceNetworkSection } from '@/components/marketplace/MarketplaceNetworkSection';
import {
  Coins,
  ShoppingBag,
  Gift,
  Handshake,
  Layers,
  Wallet,
  CheckCircle2,
  Watch,
  Sparkles,
} from 'lucide-react';

export const Marketplace: React.FC = () => {
  const { credits, walletConnected, walletAddress, connectWallet } = useCarbonFootprint();
  const [activeTab, setActiveTab] = useState<string>('carbon-credits');

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-border/60">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
              <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
              Unified Sustainability Ecosystem
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Sandbox Prototype Environment
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Carbon Footprint Fuse Marketplace
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            A comprehensive climate commerce hub: trade simulated carbon offset credits, browse sustainable lifestyle goods and solar watches, redeem earned rewards, and forge supply chain partnerships.
          </p>
        </div>

        {/* User Account / Wallet Stat Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Balance
              </div>
              <div className="text-sm font-bold text-foreground">
                {credits.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">CCT</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Web3 Status
              </div>
              {walletConnected ? (
                <div className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </div>
              ) : (
                <button
                  onClick={() => connectWallet()}
                  className="text-xs font-semibold text-primary hover:underline text-left block"
                >
                  Connect MetaMask
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Tab Navigation System */}
      <Tabs defaultValue="carbon-credits" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-11 p-1 bg-muted/70 rounded-xl gap-1 min-w-full sm:min-w-0">
            <TabsTrigger
              value="carbon-credits"
              className="text-xs font-semibold px-4 py-2 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Coins className="w-4 h-4 text-emerald-600" />
              Carbon Credit Trading
            </TabsTrigger>

            <TabsTrigger
              value="sustainable-products"
              className="text-xs font-semibold px-4 py-2 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Watch className="w-4 h-4 text-emerald-600" />
              Sustainable Products Store
            </TabsTrigger>

            <TabsTrigger
              value="rewards"
              className="text-xs font-semibold px-4 py-2 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Gift className="w-4 h-4 text-emerald-600" />
              Rewards
            </TabsTrigger>

            <TabsTrigger
              value="collaborations"
              className="text-xs font-semibold px-4 py-2 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Handshake className="w-4 h-4 text-emerald-600" />
              Collaborations
            </TabsTrigger>

            <TabsTrigger
              value="network"
              className="text-xs font-semibold px-4 py-2 rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              Network
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Carbon Credit Trading */}
        <TabsContent value="carbon-credits" className="space-y-6">
          <CarbonCreditTradingSection />
        </TabsContent>

        {/* Tab 2: Sustainable Products Store */}
        <TabsContent value="sustainable-products" className="space-y-6">
          <SustainableProductsSection />
        </TabsContent>

        {/* Tab 3: Rewards */}
        <TabsContent value="rewards" className="space-y-6">
          <MarketplaceRewardsSection />
        </TabsContent>

        {/* Tab 4: Collaborations */}
        <TabsContent value="collaborations" className="space-y-6">
          <MarketplaceCollaborationsSection />
        </TabsContent>

        {/* Tab 5: Network */}
        <TabsContent value="network" className="space-y-6">
          <MarketplaceNetworkSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketplace;
