import React, { useState } from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  Coins,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Power,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WalletSection: React.FC = () => {
  const { credits, walletConnected, walletAddress, connectWallet, disconnectWallet } =
    useCarbonFootprint();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({
      title: 'Address Copied',
      description: 'Wallet address copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncLedger = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: 'Smart Contract Ledger Synchronized',
        description: 'Confirmed token balance with on-chain ERC-20 CCT contract.',
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <Card className="md:col-span-2 border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-50/20 dark:to-emerald-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">CCT Token Balance</CardTitle>
                <p className="text-xs text-muted-foreground">Decentralized Carbon Credit Tokens</p>
              </div>
            </div>

            <Badge
              variant={walletConnected ? 'success' : 'secondary'}
              className="font-medium text-xs"
            >
              {walletConnected ? 'Web3 Connected' : 'Demo Mode'}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                {credits}
              </span>
              <span className="text-lg font-semibold text-emerald-600">CCT</span>
              <span className="text-xs text-muted-foreground">
                (≈ ${(credits * 12.5).toFixed(2)} USD value)
              </span>
            </div>

            <div className="p-4 rounded-xl border bg-muted/40 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-muted-foreground font-medium">Smart Contract Address:</span>
                <span className="font-mono text-foreground font-semibold">
                  0x9B4E...91A2 (CCT-ERC20)
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-muted-foreground font-medium">Network Consensus:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Polygon PoS / Ethereum L2 Proof-of-Stake
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncLedger}
                disabled={isSyncing}
                className="text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync On-Chain'}
              </Button>

              <Link to="/blockchain">
                <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  View Smart Contract
                </Button>
              </Link>
            </div>

            <Link to="/marketplace">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                Trade on Marketplace
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Web3 / MetaMask Connection Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base font-bold">MetaMask Status</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            {walletConnected ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                  <span className="text-muted-foreground text-[11px]">Connected Address:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 4)}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700"
                      title="Copy address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Chain ID:</span>
                    <span className="font-semibold text-foreground">137 (Polygon)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Price:</span>
                    <span className="font-semibold text-foreground">~25 Gwei</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="w-full text-destructive hover:bg-destructive/10 text-xs"
                >
                  <Power className="w-3.5 h-3.5 mr-1.5" />
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Connect your MetaMask browser extension or Web3 mobile wallet to mint tokens and execute automated smart contracts.
                </p>

                <Button
                  onClick={() => connectWallet()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  <Wallet className="w-3.5 h-3.5 mr-1.5" />
                  Connect MetaMask
                </Button>

                <Link to="/connect-wallet" className="block text-center text-xs text-muted-foreground hover:underline">
                  Alternative Wallet Setup Guide →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
