import React, { useState } from 'react';
import { useCarbonFootprint, CompanyPartner } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompanyInfoModal } from './CompanyInfoModal';
import { Users2, Building2, MapPin, Info, CheckCircle2, ShieldCheck } from 'lucide-react';

export const NetworkSection: React.FC = () => {
  const { partners, togglePartnerConnection } = useCarbonFootprint();
  const [selectedPartner, setSelectedPartner] = useState<CompanyPartner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenInfo = (partner: CompanyPartner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-600" />
            Corporate Climate Collaborations
          </h3>
          <p className="text-xs text-muted-foreground">
            Review detailed company audits and ESG documentation prior to initiating on-chain partnership connections.
          </p>
        </div>

        <Badge variant="outline" className="text-xs self-start sm:self-auto">
          {partners.filter((p) => p.connected).length} Connected Networks
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {partners.map((partner) => (
          <Card key={partner.id} className="flex flex-col justify-between border-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">
                  {partner.industry}
                </Badge>
                {partner.connected && (
                  <Badge variant="success" className="text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </Badge>
                )}
              </div>

              <CardTitle className="text-base font-bold pt-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {partner.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {partner.location}
              </p>
            </CardHeader>

            <CardContent className="py-2 text-xs space-y-2">
              <p className="text-muted-foreground line-clamp-2">
                {partner.description}
              </p>
              <div className="p-2 rounded bg-muted/40 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Annual Reduction: {partner.emissionsReduced}
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenInfo(partner)}
                className="text-xs w-full sm:w-auto"
              >
                <Info className="w-3.5 h-3.5 mr-1" />
                View Info
              </Button>

              <Button
                size="sm"
                onClick={() => togglePartnerConnection(partner.id)}
                className={`text-xs w-full sm:w-auto ${
                  partner.connected
                    ? 'bg-muted text-muted-foreground hover:bg-destructive hover:text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {partner.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <CompanyInfoModal
        partner={selectedPartner}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnectToggle={togglePartnerConnection}
      />
    </div>
  );
};
