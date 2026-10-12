import React, { useState } from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Tag, Coins } from 'lucide-react';

export const CreateListingForm: React.FC = () => {
  const { addMarketListing, credits } = useCarbonFootprint();
  const { toast } = useToast();
  const [amount, setAmount] = useState('50');
  const [pricePerCredit, setPricePerCredit] = useState('12.50');
  const [project, setProject] = useState('');
  const [country, setCountry] = useState('Global');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numPrice = parseFloat(pricePerCredit);

    if (isNaN(numAmount) || numAmount <= 0) return;
    if (isNaN(numPrice) || numPrice <= 0) return;

    if (numAmount > credits) {
      toast({
        title: 'Listing Exceeds Balance',
        description: `You only have ${credits} CCT available to list on the market.`,
        variant: 'destructive',
      });
      return;
    }

    addMarketListing({
      amount: numAmount,
      pricePerCredit: numPrice,
      pricePerCreditETH: parseFloat((numPrice / 3200).toFixed(5)),
      project: project.trim() || 'Community Certified Carbon Reduction Block',
      country: country.trim() || 'Global',
      type: 'sale',
    });

    setProject('');
  };

  const totalValue = (parseFloat(amount || '0') * parseFloat(pricePerCredit || '0')).toFixed(2);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">List Carbon Credits for Sale</CardTitle>
            <p className="text-xs text-muted-foreground">Offer your verified CCT tokens on the decentralized market.</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="listing-amount" className="text-xs font-medium">
                Amount to Sell (CCT)
              </Label>
              <Input
                id="listing-amount"
                type="number"
                min="1"
                max={credits}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Available balance: {credits} CCT</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="listing-price" className="text-xs font-medium">
                Price per Credit ($ USD)
              </Label>
              <Input
                id="listing-price"
                type="number"
                min="1"
                step="0.1"
                value={pricePerCredit}
                onChange={(e) => setPricePerCredit(e.target.value)}
                required
                className="text-xs"
              />
              <p className="text-[10px] text-emerald-600 font-medium">Total listing value: ${totalValue}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="listing-project" className="text-xs font-medium">
                Project Name or Origin
              </Label>
              <Input
                id="listing-project"
                placeholder="e.g. Solar Microgrid / Agroforestry Patch"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="listing-country" className="text-xs font-medium">
                Country / Region
              </Label>
              <Input
                id="listing-country"
                placeholder="e.g. Kenya, Brazil, Germany"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Marketplace Listing
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
