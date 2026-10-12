import React, { useState } from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Sparkles, Car, Zap, Recycle, TreePine, Calendar } from 'lucide-react';

interface ActivityOption {
  id: string;
  label: string;
  unitLabel: string;
  defaultVal: number;
  factor: number;
  category: string;
}

const PRESET_ACTIVITIES: ActivityOption[] = [
  { id: 'ev-usage', label: 'Electric Vehicle Usage (EV)', unitLabel: 'Distance (km)', defaultVal: 50, factor: 0.12, category: 'Transportation' },
  { id: 'renewable-energy', label: 'Renewable Solar / Wind Energy', unitLabel: 'Energy Generated (kWh)', defaultVal: 100, factor: 0.50, category: 'Energy' },
  { id: 'waste-recycling', label: 'Waste Segregation & Recycling', unitLabel: 'Waste Recycled (kg)', defaultVal: 25, factor: 0.10, category: 'Waste' },
  { id: 'tree-planting', label: 'Tree Planting & Afforestation', unitLabel: 'Trees Planted', defaultVal: 5, factor: 2.00, category: 'Restoration' },
];

export const ActivityForm: React.FC = () => {
  const { addActivity } = useCarbonFootprint();
  const [selectedPreset, setSelectedPreset] = useState<string>('ev-usage');
  const [value, setValue] = useState<string>('50');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePreset = PRESET_ACTIVITIES.find((p) => p.id === selectedPreset) || PRESET_ACTIVITIES[0];
  const numValue = parseFloat(value || '0');
  const calculatedReductionKg = Math.round(numValue * activePreset.factor * 10) / 10;
  const creditsCalculated = Math.max(1, Math.round(calculatedReductionKg * 2 * 10) / 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || isNaN(numValue) || numValue <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const finalTitle = customTitle.trim() || `${activePreset.label} (${numValue} ${activePreset.unitLabel.split('(')[1]?.replace(')', '') || 'units'})`;
      addActivity({
        title: finalTitle,
        category: activePreset.category,
        reductionKg: calculatedReductionKg,
        creditsEarned: creditsCalculated,
        status: 'verified',
      });
      setValue(activePreset.defaultVal.toString());
      setCustomTitle('');
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Submit Eco-Friendly Activity</CardTitle>
            <p className="text-xs text-muted-foreground">
              Record verified sustainable activities to earn on-chain carbon credits and green bonuses.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Activity Type</Label>
            <Select
              value={selectedPreset}
              onValueChange={(val) => {
                setSelectedPreset(val);
                const found = PRESET_ACTIVITIES.find((p) => p.id === val);
                if (found) setValue(found.defaultVal.toString());
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ev-usage">Electric Vehicle Usage (EV)</SelectItem>
                <SelectItem value="renewable-energy">Renewable Energy Generation</SelectItem>
                <SelectItem value="waste-recycling">Waste Recycling</SelectItem>
                <SelectItem value="tree-planting">Tree Planting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="activity-value" className="text-xs font-semibold">
                {activePreset.unitLabel}
              </Label>
              <Input
                id="activity-value"
                type="number"
                min="1"
                step="0.5"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="text-xs font-mono font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="activity-date" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Date Recorded
              </Label>
              <Input
                id="activity-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-notes" className="text-xs font-medium text-muted-foreground">
              Optional Note / Identifier
            </Label>
            <Input
              id="custom-notes"
              placeholder="e.g. Commute route 4 or Rooftop solar array 3kW"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
            <div>
              <div className="text-muted-foreground text-[11px]">CO₂ Abatement:</div>
              <div className="font-bold text-foreground text-sm">{calculatedReductionKg} kg CO₂</div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-[11px] flex items-center gap-1 justify-end">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Total Credits Earned:
              </div>
              <div className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                +{creditsCalculated} CCT <span className="text-[10px] text-emerald-600 font-semibold">(+50% bonus eligible)</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !value || numValue <= 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 shadow-sm"
          >
            {isSubmitting ? 'Verifying & Minting On-Chain...' : 'Submit Activity & Claim Credits'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
