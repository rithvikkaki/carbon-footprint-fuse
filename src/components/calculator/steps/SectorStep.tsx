import React from 'react';
import { SECTORS } from '@/hooks/useCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Zap, Factory, Sprout, CheckCircle2 } from 'lucide-react';

interface SectorStepProps {
  selectedSector: string;
  onSelectSector: (sectorId: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  transportation: <Car className="w-6 h-6 text-emerald-600" />,
  energy: <Zap className="w-6 h-6 text-emerald-600" />,
  industry: <Factory className="w-6 h-6 text-emerald-600" />,
  agriculture: <Sprout className="w-6 h-6 text-emerald-600" />,
};

export const SectorStep: React.FC<SectorStepProps> = ({
  selectedSector,
  onSelectSector,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">
          Choose Primary Emission Sector
        </h3>
        <p className="text-xs text-muted-foreground">
          Select an emission category to customize specific parameters and metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {SECTORS.map((sector) => {
          const isSelected = selectedSector === sector.id;
          return (
            <Card
              key={sector.id}
              onClick={() => onSelectSector(sector.id)}
              className={`cursor-pointer transition-all border-2 hover:border-emerald-500/50 p-1 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md'
                  : 'border-border'
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 shrink-0">
                  {ICONS[sector.id] || <Zap className="w-6 h-6 text-emerald-600" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base text-foreground">
                      {sector.name}
                    </h4>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {sector.description}
                  </p>
                  <div className="pt-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    {sector.subSectors.length} customizable factors
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
