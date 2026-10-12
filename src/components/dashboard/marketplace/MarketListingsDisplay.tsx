import React, { useState } from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { MarketListingTable } from './MarketListingTable';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const MarketListingsDisplay: React.FC = () => {
  const { marketListings, buyCreditsFromListing, cancelMarketListing } = useCarbonFootprint();
  const [query, setQuery] = useState('');

  const filtered = marketListings.filter(
    (l) =>
      l.project.toLowerCase().includes(query.toLowerCase()) ||
      l.country.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-bold text-foreground">Available Offsets Order Book</h4>
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter project or country..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      <MarketListingTable
        listings={filtered}
        onBuy={buyCreditsFromListing}
        onCancel={cancelMarketListing}
      />
    </div>
  );
};
