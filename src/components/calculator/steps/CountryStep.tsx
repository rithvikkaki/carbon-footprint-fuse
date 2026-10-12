import React from 'react';
import { COUNTRIES } from '@/hooks/useCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { Globe2, CheckCircle2 } from 'lucide-react';

interface CountryStepProps {
  selectedCountry: string;
  onSelectCountry: (code: string) => void;
}

export const CountryStep: React.FC<CountryStepProps> = ({
  selectedCountry,
  onSelectCountry,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-emerald-600" />
          Select Your Region or Country
        </h3>
        <p className="text-xs text-muted-foreground">
          Regional electricity emission coefficients and average annual consumption benchmarks calibrate your baseline calculation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
        {COUNTRIES.map((c) => {
          const isSelected = selectedCountry === c.code;
          return (
            <Card
              key={c.code}
              onClick={() => onSelectCountry(c.code)}
              className={`cursor-pointer transition-all border-2 hover:border-emerald-500/50 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm'
                  : 'border-border'
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    National Avg: {(c.avgAnnualKg / 1000).toFixed(1)} t CO₂/yr
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Grid index: {c.gridMultiplier}x
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
