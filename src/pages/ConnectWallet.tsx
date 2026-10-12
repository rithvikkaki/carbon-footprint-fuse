import React, { useState } from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ShieldCheck, CheckCircle2, Power, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConnectWallet: React.FC = () => {
  const { walletConnected, walletAddress, connectWallet, disconnectWallet } = useCarbonFootprint();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      connectWallet();
      setConnecting(false);
    }, 800);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 flex items-center justify-center min-h-[75vh]">
      <Card className="max-w-lg w-full border-border shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-1">
            <Wallet className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">
            Web3 Wallet Integration
          </CardTitle>
          <CardDescription className="text-xs">
            Connect your MetaMask or EVM compatible wallet to interact with on-chain carbon credits.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {walletConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">Network: Polygon PoS</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Wallet Public Key:</span>
                  <p className="font-mono text-sm font-bold text-foreground break-all">
                    {walletAddress}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link to="/dashboard" className="w-full sm:flex-1">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                    Go to Wallet Dashboard
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={disconnectWallet}
                  className="w-full sm:w-auto text-destructive hover:bg-destructive/10 text-xs"
                >
                  <Power className="w-3.5 h-3.5 mr-1" />
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
                >
                  {connecting ? 'Requesting Connection...' : 'Connect with MetaMask'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleConnect}
                  className="w-full h-10 text-xs"
                >
                  Connect with WalletConnect / Coinbase
                </Button>
              </div>

              <div className="space-y-2.5 pt-2 border-t text-xs text-muted-foreground">
                <h4 className="font-semibold text-foreground">Why Connect a Web3 Wallet?</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Direct ownership of ERC-20 CCT credits without central custody.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Trustless peer-to-peer settlement in the open marketplace.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Permanent cryptographic proofs of environmental offset retirements.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectWallet;
