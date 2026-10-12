import React from 'react';
import { CompanyPartner } from '@/contexts/CartonFootprintContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Globe, Leaf, CheckCircle2, Shield } from 'lucide-react';

interface CompanyInfoModalProps {
  partner: CompanyPartner | null;
  isOpen: boolean;
  onClose: () => void;
  onConnectToggle: (partnerId: string) => void;
}

export const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({
  partner,
  isOpen,
  onClose,
  onConnectToggle,
}) => {
  if (!partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {partner.industry}
            </Badge>
            <Badge variant={partner.connected ? 'success' : 'outline'} className="text-xs">
              {partner.connected ? 'Active Partner' : 'Available Partner'}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            {partner.name}
          </DialogTitle>
          <DialogDescription className="text-xs flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5" />
            {partner.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" />
              Verified Annual Reduction Impact:
            </div>
            <p className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              {partner.emissionsReduced}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-foreground">Mission & Collaboration Scope:</h4>
            <p className="text-muted-foreground leading-relaxed">
              {partner.description}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              Smart Contract Cross-Verification
            </div>
            <p className="text-[11px] text-muted-foreground">
              Connecting allows bidirectional carbon offset certificate validation, mutual scope-3 offset recognition, and joint CCT liquidity staking.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            <a
              href={partner.website}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline text-xs"
            >
              Visit Organization Website
            </a>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onConnectToggle(partner.id);
              onClose();
            }}
            className={`text-xs ${
              partner.connected
                ? 'bg-destructive hover:bg-destructive/90 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {partner.connected ? 'Disconnect Partner' : 'Establish Partnership'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
