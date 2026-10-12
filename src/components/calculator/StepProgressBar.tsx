import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = [
  'Country & Grid',
  'Sector Selection',
  'Sub-Sector Focus',
  'Activity Inputs',
  'Footprint Audit',
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps = 5,
  onStepClick,
}) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-muted w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-300 z-0"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={stepNum}
              className="flex flex-col items-center relative z-10 cursor-pointer"
              onClick={() => onStepClick && onStepClick(stepNum)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-white dark:bg-slate-900 border-2 border-emerald-600 text-emerald-600 ring-4 ring-emerald-500/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={`hidden sm:block text-[11px] font-medium mt-2 whitespace-nowrap ${
                  isCurrent ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
