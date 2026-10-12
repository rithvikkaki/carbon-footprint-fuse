import React, { useState } from 'react';
import { MarketListing } from '@/contexts/CartonFootprintContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ListingActionButton } from './ListingActionButton';
import { ShieldCheck, FileText, CheckCircle2, Award, ExternalLink, Hash } from 'lucide-react';
import { provenanceApi } from '@/lib/api';

interface MarketListingTableProps {
  listings: MarketListing[];
  onBuy: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const MarketListingTable: React.FC<MarketListingTableProps> = ({
  listings,
  onBuy,
  onCancel,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenProvenance = async (listing: MarketListing) => {
    if (listing.batch) {
      setSelectedBatch(listing.batch);
      setIsDialogOpen(true);
      return;
    }
    if (listing.batchId) {
      setLoadingBatch(true);
      try {
        const data = await provenanceApi.getBatchDetails(listing.batchId);
        setSelectedBatch(data);
        setIsDialogOpen(true);
      } catch (e) {
        console.error('Failed to fetch batch provenance', e);
      } finally {
        setLoadingBatch(false);
      }
    }
  };

  if (listings.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border rounded-xl">
        No active carbon credit listings at this time. Create a listing above!
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs">Project & Provenance</TableHead>
              <TableHead className="text-xs">Country</TableHead>
              <TableHead className="text-xs">Registry & Vintage</TableHead>
              <TableHead className="text-xs text-right">Volume (CCT)</TableHead>
              <TableHead className="text-xs text-right">Unit Price</TableHead>
              <TableHead className="text-xs text-right">Total USD</TableHead>
              <TableHead className="text-xs text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((l) => (
              <TableRow key={l.id} className="text-xs hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold line-clamp-1">{l.project}</span>
                    </div>
                    {l.batchNumber ? (
                      <button
                        onClick={() => handleOpenProvenance(l)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 hover:underline"
                        title="View Full Third-Party Provenance Certificate"
                      >
                        <Award className="w-3 h-3 text-emerald-600" />
                        <span>{l.batchNumber}</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Standard Batch</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{l.country}</TableCell>
                <TableCell className="text-muted-foreground">
                  {l.batch ? (
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground">{l.batch.registry_name}</span>
                      <div className="text-[10px] text-muted-foreground">
                        {l.batch.registry_id || 'ID Pending'} • {l.batch.vintage_year}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px]">Verified Registry</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-bold text-foreground">
                  {l.amount} CCT
                </TableCell>
                <TableCell className="text-right font-medium text-muted-foreground">
                  ${l.pricePerCredit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600">
                  ${(l.amount * l.pricePerCredit).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <ListingActionButton listing={l} onBuy={onBuy} onCancel={onCancel} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Provenance Audit Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedBatch && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                    {selectedBatch.batch_number}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Status: {selectedBatch.verification_status}
                  </Badge>
                </div>
                <DialogTitle className="text-lg font-bold text-foreground mt-2">
                  {selectedBatch.project_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Immutable provenance record for accredited carbon credit batch.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Registry</span>
                  <span className="font-semibold text-foreground">{selectedBatch.registry_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Registry Project ID</span>
                  <span className="font-semibold text-foreground">{selectedBatch.registry_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Methodology</span>
                  <span className="font-semibold text-foreground">{selectedBatch.methodology}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Vintage Year</span>
                  <span className="font-semibold text-foreground">{selectedBatch.vintage_year}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Project Location</span>
                  <span className="font-semibold text-foreground">{selectedBatch.project_location}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Accredited Auditor</span>
                  <span className="font-semibold text-emerald-600">{selectedBatch.verification_org || 'EcoFuse Verifier'}</span>
                </div>
              </div>

              {/* Evidence Document Hash Section */}
              <div className="p-3 border rounded-lg space-y-1.5 bg-card">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Third-Party Verification Evidence</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Document: <span className="font-medium text-foreground">{selectedBatch.evidence_doc_name || 'Project_Design_Document_PDD.pdf'}</span>
                </div>
                {selectedBatch.evidence_hash && (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted p-1.5 rounded">
                    <Hash className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">SHA-256: {selectedBatch.evidence_hash}</span>
                  </div>
                )}
              </div>

              {/* Verification Audit Logs */}
              {selectedBatch.verification_logs && selectedBatch.verification_logs.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-foreground">Audit & Verification Timeline</h5>
                  <div className="space-y-1.5">
                    {selectedBatch.verification_logs.map((log: any) => (
                      <div key={log.id} className="p-2 border rounded-md text-xs space-y-0.5 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-700 capitalize">
                            Status: {log.to_status}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(log.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">{log.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-xs">
                  Close Provenance Record
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
