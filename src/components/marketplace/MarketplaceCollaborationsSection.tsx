import React, { useState } from 'react';
import { useCarbonFootprint, CompanyPartner } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CompanyInfoModal } from '@/components/dashboard/CompanyInfoModal';
import {
  Handshake,
  Building2,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  Leaf,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const MarketplaceCollaborationsSection: React.FC = () => {
  const {
    partners,
    togglePartnerConnection,
    collaborationProposals,
    proposeCollaboration,
    walletConnected,
    walletAddress,
  } = useCarbonFootprint();

  const [tierFilter, setTierFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [infoPartner, setInfoPartner] = useState<CompanyPartner | null>(null);

  // Proposal modal state
  const [proposalPartner, setProposalPartner] = useState<CompanyPartner | null>(null);
  const [proposalScope, setProposalScope] = useState<string>('Scope 3 Emissions Reduction');
  const [proposalMessage, setProposalMessage] = useState<string>('');

  const tiers = ['All', 'Direct Corporate Partner', 'Tier 1 Supplier', 'Tier 2 Supplier'];

  const filteredPartners = partners.filter((p) => {
    const matchesTier = tierFilter === 'All' || p.tier === tierFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalPartner || !proposalMessage.trim()) return;

    proposeCollaboration(proposalPartner.id, proposalScope, proposalMessage);
    setProposalPartner(null);
    setProposalMessage('');
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="rounded-2xl p-6 sm:p-8 border bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-primary/10 backdrop-blur relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-semibold">
            <Handshake className="w-3.5 h-3.5" />
            Supply Chain & Enterprise Collaborations (Demo Network)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Tier 1 & Tier 2 Supplier Sustainability Network
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Illustrative supply chain accountability directory. Test multi-tier Scope 3 carbon auditing, mutual partnership proposals, and tokenized offset allocation workflows.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sample supplier profiles & ESG metrics</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Modeled multi-tier supplier attribution</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tiers.map((tier) => (
            <Button
              key={tier}
              variant={tierFilter === tier ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTierFilter(tier)}
              className={
                tierFilter === tier
                  ? 'eco-gradient-bg text-white shadow-sm'
                  : 'text-xs hover:bg-muted'
              }
            >
              {tier}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company, industry, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="flex flex-col justify-between border-border hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    partner.tier === 'Direct Corporate Partner'
                      ? 'default'
                      : partner.tier === 'Tier 1 Supplier'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-[10px]"
                >
                  {partner.tier}
                </Badge>
                {partner.connected && (
                  <Badge variant="success" className="text-[10px] flex items-center gap-1 bg-emerald-600 text-white">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </Badge>
                )}
              </div>

              <CardTitle className="text-base font-bold pt-2 flex items-center gap-2 group-hover:text-primary transition-colors">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {partner.name}
              </CardTitle>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>{partner.industry}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {partner.location}
                </span>
              </div>
            </CardHeader>

            <CardContent className="py-2 text-xs space-y-3 flex-1">
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {partner.description}
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Annual Reduction: {partner.emissionsReduced}</span>
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t flex flex-col sm:flex-row items-center gap-2 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInfoPartner(partner)}
                className="text-xs w-full sm:w-auto"
              >
                Audit Info
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setProposalPartner(partner)}
                className="text-xs w-full sm:w-auto text-emerald-700 dark:text-emerald-300 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              >
                Propose
              </Button>

              <Button
                size="sm"
                onClick={() => togglePartnerConnection(partner.id)}
                className={`text-xs w-full sm:w-auto ml-auto ${
                  partner.connected
                    ? 'bg-muted text-muted-foreground hover:bg-destructive hover:text-white'
                    : 'eco-gradient-bg text-white'
                }`}
              >
                {partner.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Proposals Ledger */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Handshake className="w-4 h-4 text-emerald-600" />
                Submitted Collaboration Proposals & In-Flight Initiatives
              </CardTitle>
              <CardDescription className="text-xs">
                Track formal sustainability proposals, mutual agreements, and audit statuses.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {collaborationProposals.length} Proposals Logged
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Proposal ID</TableHead>
                <TableHead className="text-xs">Partner Enterprise</TableHead>
                <TableHead className="text-xs">Proposed Scope</TableHead>
                <TableHead className="text-xs">Initiated By</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborationProposals.map((prop) => (
                <TableRow key={prop.id} className="text-xs">
                  <TableCell className="font-mono font-medium">{prop.id}</TableCell>
                  <TableCell className="font-bold">{prop.partnerName}</TableCell>
                  <TableCell className="font-medium">{prop.scope}</TableCell>
                  <TableCell className="font-mono text-muted-foreground text-[11px]">
                    {prop.proposedBy.length > 16 ? `${prop.proposedBy.substring(0, 10)}...` : prop.proposedBy}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        prop.status === 'Connected'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {prop.status === 'Connected' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {prop.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{prop.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Modal */}
      <CompanyInfoModal
        partner={infoPartner}
        isOpen={!!infoPartner}
        onClose={() => setInfoPartner(null)}
        onConnectToggle={togglePartnerConnection}
      />

      {/* Proposal Modal */}
      <Dialog open={!!proposalPartner} onOpenChange={(open) => !open && setProposalPartner(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {proposalPartner?.tier}
              </Badge>
              <span className="text-xs text-muted-foreground">{proposalPartner?.industry}</span>
            </div>
            <DialogTitle className="text-lg font-bold">
              Propose Partnership with {proposalPartner?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Establish formal Scope 3 collaboration, green procurement parameters, or joint offset allocation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendProposal} className="space-y-4 py-1 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Initiative Scope</Label>
              <Select value={proposalScope} onValueChange={setProposalScope}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select partnership scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scope 3 Emissions Reduction">Scope 3 Emissions Reduction</SelectItem>
                  <SelectItem value="Sustainable Procurement & Sourcing">Sustainable Procurement & Sourcing</SelectItem>
                  <SelectItem value="Joint Carbon-Credit Pooling & Offsets">Joint Carbon-Credit Pooling & Offsets</SelectItem>
                  <SelectItem value="Supplier ESG Auditing & Traceability">Supplier ESG Auditing & Traceability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-msg" className="text-xs font-semibold">
                Proposal Summary & Objectives
              </Label>
              <Textarea
                id="prop-msg"
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="Detail emissions reduction targets, milestone schedules, or tokenized credit allocation parameters..."
                className="text-xs min-h-[90px]"
                required
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border text-[11px] text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Cryptographic Identity Signoff
              </div>
              <p>
                This proposal is signed locally by your active address (
                <span className="font-mono text-foreground font-semibold">
                  {walletConnected ? `${walletAddress.substring(0, 10)}...` : 'Demo ESG Office'}
                </span>
                ) and recorded in your local browser demonstration ledger.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProposalPartner(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="eco-gradient-bg text-white gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Submit Proposal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
