import React from 'react';
import { SectorConfig } from '@/hooks/useCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, CheckCircle2 } from 'lucide-react';

interface SubSectorStepProps {
  activeSector: SectorConfig;
  selectedSubSector: string;
  onSelectSubSector: (id: string) => void;
}

export const SubSectorStep: React.FC<SubSectorStepProps> = ({
  activeSector,
  selectedSubSector,
  onSelectSubSector,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          {activeSector.name} Sub-Sectors
        </h3>
        <p className="text-xs text-muted-foreground">
          Drill down into individual emission activities and see their respective measurement units.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {activeSector.subSectors.map((sub) => {
          const isSelected = selectedSubSector === sub.id;
          return (
            <Card
              key={sub.id}
              onClick={() => onSelectSubSector(sub.id)}
              className={`cursor-pointer transition-all border-2 hover:border-emerald-500/50 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm'
                  : 'border-border'
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-foreground">
                    {sub.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {sub.description}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    Measurement: <span className="underline">{sub.unit}</span>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
