import React from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { CreateListingForm } from '@/components/dashboard/marketplace/CreateListingForm';
import { MarketListingsDisplay } from '@/components/dashboard/marketplace/MarketListingsDisplay';
import { CreditRetirementManager } from '@/components/marketplace/CreditRetirementManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Coins,
  TrendingUp,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const CarbonCreditTradingSection: React.FC = () => {
  const { marketListings, creditTransactions, credits, walletConnected, walletAddress } =
    useCarbonFootprint();

  const totalLiquidity = marketListings.reduce((acc, curr) => acc + curr.amount, 0);
  const avgPrice =
    marketListings.length > 0
      ? (
          marketListings.reduce((acc, curr) => acc + curr.pricePerCredit, 0) /
          marketListings.length
        ).toFixed(2)
      : '2.40';

  return (
    <div className="space-y-8">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/70 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Your Available CCT
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {credits.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">CCT</span>
              </h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">
                ≈ ${(credits * parseFloat(avgPrice)).toFixed(2)} USD
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Total Available Liquidity
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {totalLiquidity.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">CCT</span>
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">Across verified registries</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Average Market Price
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                ${avgPrice} <span className="text-xs font-normal text-muted-foreground">/ CCT</span>
              </h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                Live Spot Indexed
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Protocol Architecture
              </p>
              <h3 className="text-base font-bold text-foreground mt-1 flex items-center gap-1.5">
                Polygon PoS <Badge variant="outline" className="text-[10px] font-mono py-0">Target ERC-20</Badge>
              </h3>
              <p className="text-[10px] text-muted-foreground font-mono mt-1">
                {walletConnected ? `Signer: ${walletAddress.substring(0, 8)}...` : 'Client Sandbox State'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sell / Mint Carbon Credit Form */}
      <CreateListingForm />

      {/* Traceable Retirement Manager */}
      <CreditRetirementManager />

      {/* Available Offsets Order Book */}
      <MarketListingsDisplay />

      {/* Simulated Credit Transactions History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Simulated Credit Transaction History
              </CardTitle>
              <CardDescription className="text-xs">
                Local client demonstration ledger recording credit purchases, sales, and token movements.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Mode: In-Memory / LocalStorage
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Tx Hash</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Counterparty</TableHead>
                <TableHead className="text-xs text-right">Volume (CCT)</TableHead>
                <TableHead className="text-xs text-right">Value (ETH)</TableHead>
                <TableHead className="text-xs text-right">Unit Price</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditTransactions.map((tx) => (
                <TableRow key={tx.id} className="text-xs">
                  <TableCell className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 4)}
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-[11px]">{tx.counterparty}</TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {tx.amountCCT} CCT
                  </TableCell>
                  <TableCell className="text-right font-mono text-[11px]">
                    {tx.priceETH.toFixed(4)} ETH
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">
                    ${tx.pricePerCredit.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[11px]">
                    {tx.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
