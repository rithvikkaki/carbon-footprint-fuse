import React, { useState } from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Activity,
  Globe2,
  ShieldCheck,
  Cpu,
  Zap,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Wifi,
  Wallet,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MarketplaceNetworkSection: React.FC = () => {
  const { walletConnected, walletAddress, connectWallet, creditTransactions, partners } =
    useCarbonFootprint();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [detectedBlock, setDetectedBlock] = useState<string | null>(null);
  const [detectedChain, setDetectedChain] = useState<string | null>(null);

  const connectedPartnersCount = partners.filter((p) => p.connected).length;

  const handleVerifyNodeState = async () => {
    setIsVerifying(true);
    const anyWindow = window as any;

    if (typeof window !== 'undefined' && anyWindow.ethereum) {
      try {
        const chainId = await anyWindow.ethereum.request({ method: 'eth_chainId' });
        const block = await anyWindow.ethereum.request({ method: 'eth_blockNumber' });
        const blockNum = parseInt(block, 16);
        setDetectedChain(chainId);
        setDetectedBlock(blockNum.toString());

        toast({
          title: 'Live Web3 Provider Detected',
          description: `Connected to Chain ID ${chainId}. Latest block height: ${blockNum}.`,
        });
        setIsVerifying(false);
        return;
      } catch (err: any) {
        console.warn('Web3 node query error:', err);
      }
    }

    // Honest client sandbox feedback
    setTimeout(() => {
      setIsVerifying(false);
      toast({
        title: 'Sandbox Simulation Mode',
        description: 'No live Web3 provider connected. Running in client-side prototype mode with local state storage.',
      });
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            Prototype Architecture & Sandbox Verification Notice
          </p>
          <p className="text-muted-foreground dark:text-amber-300/80 leading-relaxed text-[11px]">
            The smart contract addresses and network telemetry shown below represent the intended technical specifications for the Carbon Footprint Fuse architecture on Polygon PoS. Smart contracts are currently in design/prototype phase and are not yet deployed to public mainnets or audited by third-party firms. Transactions in this interface currently execute through an in-memory client-side ledger.
          </p>
        </div>
      </div>

      {/* Network Header */}
      <div className="rounded-2xl p-6 sm:p-8 border bg-gradient-to-br from-blue-500/10 via-emerald-500/5 to-primary/10 backdrop-blur relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Polygon PoS Target Architecture (Amoy 80002)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Network Protocol & Web3 Diagnostics
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Verify your local browser Web3 connection state, review intended smart contract standards, and inspect local ledger state commitments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyNodeState}
              disabled={isVerifying}
              className="text-xs bg-background/80"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isVerifying ? 'animate-spin' : ''}`} />
              Test Web3 Provider
            </Button>
            {!walletConnected ? (
              <Button
                size="sm"
                onClick={() => connectWallet()}
                className="text-xs eco-gradient-bg text-white shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Connect MetaMask
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="text-xs font-mono"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Target Network
              </span>
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">
              {detectedChain ? `Chain ID ${detectedChain}` : 'Polygon Amoy (80002)'}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {detectedBlock ? `Latest Block: #${detectedBlock}` : 'Ready for testnet RPC'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Estimated Gas
              </span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg font-bold text-foreground">~25-30 Gwei</div>
            <p className="text-[11px] text-muted-foreground">Polygon PoS testnet benchmark</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Sample Suppliers
              </span>
              <Globe2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-lg font-bold text-foreground">{connectedPartnersCount} Active</div>
            <p className="text-[11px] text-muted-foreground">{partners.length} Sample Profiles</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Execution Environment
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-foreground">Client Sandbox</div>
            <p className="text-[11px] text-muted-foreground">LocalStorage Persistence</p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Contract Specifications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                Smart Contract Design Specifications
              </CardTitle>
              <CardDescription className="text-xs">
                Proposed smart contract standards and mock reference addresses for the Carbon Footprint Fuse protocol.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs text-amber-700 dark:text-amber-300 border-amber-300">
              Pending Public Deployment
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Contract Module</TableHead>
                <TableHead className="text-xs">Proposed Standard</TableHead>
                <TableHead className="text-xs">Reference Address (Mock)</TableHead>
                <TableHead className="text-xs">Deployment Status</TableHead>
                <TableHead className="text-xs text-right">Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-xs">
                <TableCell className="font-bold">Carbon Credit Token (CCT)</TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px]">ERC-20</Badge></TableCell>
                <TableCell className="font-mono text-muted-foreground">0x71C8A6517a4c4B2bB8251e604F18df7B08B57497</TableCell>
                <TableCell className="text-amber-600 font-medium">Design Mock (Unverified)</TableCell>
                <TableCell className="text-right text-muted-foreground">Testnet Pending</TableCell>
              </TableRow>

              <TableRow className="text-xs">
                <TableCell className="font-bold">Emissions Offset Registry</TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px]">ERC-721 Soulbound</Badge></TableCell>
                <TableCell className="font-mono text-muted-foreground">0x38Bc26Da1C0a542b8fB96F31f478e06385dD0D36</TableCell>
                <TableCell className="text-amber-600 font-medium">Design Mock (Unverified)</TableCell>
                <TableCell className="text-right text-muted-foreground">Testnet Pending</TableCell>
              </TableRow>

              <TableRow className="text-xs">
                <TableCell className="font-bold">Supplier ESG Verification Oracle</TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px]">Chainlink Oracle Interface</Badge></TableCell>
                <TableCell className="font-mono text-muted-foreground">0x91F5627E5f739668388916De7A05a61b8fA0b372</TableCell>
                <TableCell className="text-amber-600 font-medium">Design Mock (Unverified)</TableCell>
                <TableCell className="text-right text-muted-foreground">Testnet Pending</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Network Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Local Ledger Transaction Feed
              </CardTitle>
              <CardDescription className="text-xs">
                Locally recorded transaction events stored in browser state for demonstration.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Badge variant="outline" className="text-[10px]">
                In-Memory / LocalStorage
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Tx Identifier</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Counterparty</TableHead>
                <TableHead className="text-xs text-right">Volume (CCT)</TableHead>
                <TableHead className="text-xs text-right">Value (ETH)</TableHead>
                <TableHead className="text-xs">Timestamp</TableHead>
                <TableHead className="text-xs text-right">Confirmation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditTransactions.map((tx) => (
                <TableRow key={tx.id} className="text-xs">
                  <TableCell className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
                    {tx.txHash.substring(0, 14)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-[11px]">
                    {tx.counterparty}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {tx.amountCCT} CCT
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {tx.priceETH.toFixed(4)} ETH
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Client Confirmed
                    </span>
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
