import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAuthToken, provenanceApi } from '@/lib/api';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Flame, Award, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CreditRetirementManager: React.FC = () => {
  const { credits, deductCredits } = useCarbonFootprint();
  const { toast } = useToast();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [amount, setAmount] = useState<number>(10);
  const [beneficiary, setBeneficiary] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchMyBatches = async () => {
    const token = getAuthToken();
    if (!token) {
      setBatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await provenanceApi.getBatches({ my_only: true });
      setBatches(data);
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (
        errMsg.includes('Not authenticated') ||
        errMsg.includes('401') ||
        errMsg.includes('Could not validate')
      ) {
        // Silently reset batches when session is not authenticated or expired
        setBatches([]);
      } else {
        toast({
          title: 'Error loading batches',
          description: errMsg || 'Could not fetch your credit batches',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMyBatches();
  }, []);

  const handleRetire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getAuthToken()) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to retire verified carbon credits.',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedBatch) return;
    if (amount <= 0 || amount > selectedBatch.available_quantity) {
      toast({
        title: 'Invalid Retirement Amount',
        description: `Must be between 1 and ${selectedBatch.available_quantity} tCO2e`,
        variant: 'destructive',
      });
      return;
    }
    if (!beneficiary.trim()) {
      toast({
        title: 'Beneficiary required',
        description: 'Please specify the legal entity or person claiming the offset',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const cert = await provenanceApi.retireCredits(selectedBatch.id, {
        amount,
        beneficiary: beneficiary.trim(),
        retirement_reason: reason.trim() || 'Voluntary corporate GHG offset',
      });
      setCertificate(cert);
      setIsDialogOpen(true);
      toast({
        title: 'Credits Retired Successfully',
        description: `Certificate generated: ${cert.certificate_code}`,
      });
      fetchMyBatches();
      if (deductCredits) deductCredits(amount, 'Carbon credit permanent retirement');
    } catch (err: any) {
      toast({
        title: 'Retirement failed',
        description: err.message || 'Could not retire credits',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base font-bold text-foreground">
                  Permanent Carbon Credit Retirement
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Permanently burn verified carbon credits from your registry batch to prevent double-spending and generate an official, tamper-evident retirement certificate.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Balance: {credits} CCT
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {batches.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  Loading your credit batches...
                </div>
              ) : !getAuthToken() ? (
                'Sign in to manage and retire your verified carbon credit batches.'
              ) : (
                'No verified batches currently registered under your account. Batches must be verified before retirement.'
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches
                .filter((b) => b.verification_status === 'verified' && b.available_quantity > 0)
                .map((batch) => (
                  <div
                    key={batch.id}
                    className={`p-4 border rounded-xl space-y-3 cursor-pointer transition-all ${
                      selectedBatch?.id === batch.id
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                        : 'hover:border-border/90'
                    }`}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setAmount(Math.min(10, batch.available_quantity));
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {batch.batch_number}
                      </Badge>
                      <span className="text-xs font-bold text-emerald-600">
                        {batch.available_quantity} {batch.unit} Available
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{batch.project_name}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {batch.registry_name} ({batch.vintage_year}) • {batch.project_location}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {selectedBatch && (
            <form onSubmit={handleRetire} className="p-4 border rounded-xl space-y-4 bg-muted/20">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Retire Credits from {selectedBatch.batch_number}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Quantity to Retire ({selectedBatch.unit})</Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedBatch.available_quantity}
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Beneficiary Organization / Individual</Label>
                  <Input
                    placeholder="e.g. Acme Tech Corp"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className="text-xs h-8"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Retirement Purpose / Claim</Label>
                  <Input
                    placeholder="e.g. Scope 1 Fleet Emissions Offset 2024"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-xs h-8"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Burning Credits & Generating Certificate...
                    </>
                  ) : (
                    <>
                      <Flame className="w-3.5 h-3.5 mr-1.5" />
                      Retire {amount} {selectedBatch.unit} Permanently
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Official Certificate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {certificate && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Award className="w-7 h-7" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Official Carbon Retirement Certificate
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  This permanent retirement certificate serves as non-transferable proof of climate action.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 border rounded-xl bg-card text-left space-y-2 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Certificate Code:</span>
                  <span className="font-mono font-bold text-emerald-700">{certificate.certificate_code}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Verification Scope:</span>
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                    {certificate.verification_authority || 'Internal Platform Ledger'}
                  </Badge>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Retired Quantity:</span>
                  <span className="font-bold">{certificate.amount} tCO2e</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Beneficiary:</span>
                  <span className="font-semibold">{certificate.beneficiary}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Retirement Reason:</span>
                  <span className="text-right text-muted-foreground">{certificate.retirement_reason}</span>
                </div>
                <div className="pt-2 text-[10px] text-muted-foreground bg-muted/40 p-2 rounded-lg leading-relaxed border">
                  <strong>Disclosure:</strong> {certificate.registry_disclaimer || 'This certificate confirms retirement recorded within the internal EcoFuse platform ledger. It does not represent an unbundled surrender on external statutory registries (such as Verra Registry, Gold Standard, or CDM) unless explicitly synchronized through certified registry APIs.'}
                </div>
              </div>

              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                onClick={() => setIsDialogOpen(false)}
              >
                Close Certificate
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
