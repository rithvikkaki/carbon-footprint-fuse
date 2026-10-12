import React from 'react';
import { SectorConfig } from '@/hooks/useCalculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Sliders, Sparkles } from 'lucide-react';

interface ActivityStepProps {
  activeSector: SectorConfig;
  inputs: Record<string, number>;
  onInputChange: (subSectorId: string, val: number) => void;
}

export const ActivityStep: React.FC<ActivityStepProps> = ({
  activeSector,
  inputs,
  onInputChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          Specify {activeSector.name} Activity Levels
        </h3>
        <p className="text-xs text-muted-foreground">
          Enter your current typical consumption levels. You can adjust these anytime to simulate savings and rewards.
        </p>
      </div>

      <div className="space-y-4">
        {activeSector.subSectors.map((sub) => {
          const currentVal = inputs[sub.id] !== undefined ? inputs[sub.id] : sub.defaultVal;

          return (
            <Card key={sub.id} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <Label className="font-semibold text-sm text-foreground">
                      {sub.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {sub.description}
                    </p>
                  </div>
                  <div className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-muted text-muted-foreground self-start sm:self-auto">
                    Unit: {sub.unit}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max={sub.id === 'flights' ? 100 : sub.id.includes('car') ? 1000 : 800}
                    step={sub.id === 'flights' ? 1 : 5}
                    value={currentVal}
                    onChange={(e) => onInputChange(sub.id, parseFloat(e.target.value) || 0)}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-muted rounded-lg"
                  />
                  <div className="w-28 shrink-0">
                    <Input
                      type="number"
                      min="0"
                      value={currentVal}
                      onChange={(e) => onInputChange(sub.id, parseFloat(e.target.value) || 0)}
                      className="text-right font-medium text-sm"
                    />
                  </div>
                </div>

                {sub.factorKgCo2 < 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Green credit: Active offset reduction factor applied!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
