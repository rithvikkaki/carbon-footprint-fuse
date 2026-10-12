import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Blocks,
  Cpu,
  KeyRound,
  FileCode2,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const BlockchainPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="secondary" className="text-emerald-800 dark:text-emerald-300">
          Cryptographic Architecture
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Decentralized Carbon Ledger & Smart Contracts
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          How Carbon Footprint Fuse uses verifiable blockchain infrastructure to solve the historical carbon market challenges of double-counting, greenwashing, and opaque broker fees.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 w-fit">
              <Blocks className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">ERC-20 Tokenomics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every verified reduction unit converts into fungible CCT (Carbon Credit Token) on Polygon Proof-of-Stake with near-zero energy overhead and sub-cent transaction fees.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 w-fit">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Permanent Retirement (Burn)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When an enterprise offsets their emissions, the corresponding CCT is permanently burned, issuing an immutable soulbound ERC-721 certificate to prove compliance.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">Oracle Verification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Chainlink and decentralized environmental oracles ingest smart meter readings, satellite biomass scans, and verified registry API endpoints before minting approvals.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contract Interface Mock */}
      <Card className="border-emerald-500/20">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base font-bold">EcoFuseCore.sol Contract Interface</CardTitle>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Contract: 0x9B4E38F1102A8842cDe841297A4465B491A2
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto space-y-2">
            <p className="text-slate-500">// SPDX-License-Identifier: MIT</p>
            <p className="text-emerald-400">pragma solidity ^0.8.20;</p>
            <br />
            <p><span className="text-purple-400">contract</span> <span className="text-yellow-300">EcoFuseCarbonCredit</span> <span className="text-purple-400">is</span> ERC20, Ownable {'{'}</p>
            <p className="pl-4 text-slate-400">{'/// @notice Mints carbon credits upon verified audit proof'}</p>
            <p className="pl-4"><span className="text-purple-400">function</span> <span className="text-blue-400">mintAuditedCredit</span>(address to, uint256 reductionKg, bytes calldata proof) external onlyOracle;</p>
            <br />
            <p className="pl-4 text-slate-400">{'/// @notice Permanently retires credits and issues certificate'}</p>
            <p className="pl-4"><span className="text-purple-400">function</span> <span className="text-blue-400">retireAndBurn</span>(uint256 amountCCT, string calldata purpose) external returns (uint256 certId);</p>
            <p>{'}'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainPage;
