import React from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { RewardsTab } from '@/components/dashboard/RewardsTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ticket, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MarketplaceRewardsSection: React.FC = () => {
  const { rewardRedemptions } = useCarbonFootprint();
  const { toast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Voucher Copied!',
      description: `Code ${code} copied to clipboard.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Rewards Catalog */}
      <RewardsTab />

      {/* Redeemed Vouchers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-600" />
                Your Redeemed Reward Vouchers
              </CardTitle>
              <CardDescription className="text-xs">
                Demonstration vouchers and test codes generated from your carbon credit balance. Persisted in local browser storage.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {rewardRedemptions.length} Active Vouchers
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rewardRedemptions.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              You haven't redeemed any vouchers yet. Browse the catalog above and spend your CCT!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Voucher Code</TableHead>
                  <TableHead className="text-xs">Reward Title</TableHead>
                  <TableHead className="text-xs text-right">Cost (CCT)</TableHead>
                  <TableHead className="text-xs">Redeemed Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewardRedemptions.map((red) => (
                  <TableRow key={red.id} className="text-xs">
                    <TableCell className="font-mono font-bold text-foreground">
                      {red.voucherCode}
                    </TableCell>
                    <TableCell className="font-semibold">{red.title}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      -{red.costCCT} CCT
                    </TableCell>
                    <TableCell className="text-muted-foreground">{red.date}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Valid
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleCopyCode(red.voucherCode)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
