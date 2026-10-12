import React from 'react';
import { CreateListingForm } from './marketplace/CreateListingForm';
import { MarketListingsDisplay } from './marketplace/MarketListingsDisplay';
import { Coins, ArrowLeftRight } from 'lucide-react';

export const MarketplaceSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
            Carbon Credits Marketplace (CCT Exchange)
          </h3>
          <p className="text-xs text-muted-foreground">
            Buy certified environmental offset contracts or sell your audited tokenized carbon credits.
          </p>
        </div>
        <a
          href="/marketplace"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
        >
          <span>Open Full Store & Watches</span>
          <Coins className="w-3.5 h-3.5" />
        </a>
      </div>

      <CreateListingForm />
      <MarketListingsDisplay />
    </div>
  );
};
