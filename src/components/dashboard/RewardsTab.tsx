import React from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Coins, Check, Zap, TreePine, Plane, ShoppingBag } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Lifestyle: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
  Mobility: <Zap className="w-5 h-5 text-emerald-600" />,
  Restoration: <TreePine className="w-5 h-5 text-emerald-600" />,
  Travel: <Plane className="w-5 h-5 text-emerald-600" />,
};

export const RewardsTab: React.FC = () => {
  const { rewards, credits, redeemReward } = useCarbonFootprint();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            Decentralized Sustainability Rewards
          </h3>
          <p className="text-xs text-muted-foreground">
            Redeem your earned carbon credits for verified partner perks, vouchers, and direct climate impacts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <Coins className="w-4 h-4 text-emerald-600" />
          <span>Available to Spend: {credits} CCT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rewards.map((reward) => {
          const canAfford = credits >= reward.cost;

          return (
            <Card key={reward.id} className="flex flex-col justify-between border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    {CATEGORY_ICONS[reward.category] || <Gift className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {reward.category}
                  </Badge>
                </div>

                <CardTitle className="text-sm font-bold pt-2 line-clamp-2">
                  {reward.title}
                </CardTitle>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  by {reward.provider}
                </p>
              </CardHeader>

              <CardContent className="py-2 text-xs text-muted-foreground leading-relaxed">
                <p>{reward.description}</p>
              </CardContent>

              <CardFooter className="pt-3 border-t flex items-center justify-between">
                <div className="flex items-center gap-1 font-bold text-sm text-foreground">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>{reward.cost} CCT</span>
                </div>

                <Button
                  size="sm"
                  disabled={!canAfford}
                  onClick={() => redeemReward(reward.id)}
                  className={`text-xs ${
                    canAfford
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Redeem Voucher' : 'Need More CCT'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
