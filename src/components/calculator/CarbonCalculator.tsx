import React from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { StepProgressBar } from './StepProgressBar';
import { InfoSidebar } from './InfoSidebar';
import { CountryStep } from './steps/CountryStep';
import { SectorStep } from './steps/SectorStep';
import { SubSectorStep } from './steps/SubSectorStep';
import { ActivityStep } from './steps/ActivityStep';
import { CalculationResult } from './CalculationResult';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CarbonCalculator: React.FC = () => {
  const {
    currentStep,
    selectedCountry,
    setSelectedCountry,
    selectedSector,
    setSelectedSector,
    selectedSubSector,
    setSelectedSubSector,
    inputs,
    setInputValue,
    countryData,
    activeSectorConfig,
    calculationSummary,
    nextStep,
    prevStep,
    goToStep,
    saveCalculationToDashboard,
  } = useCalculator();

  return (
    <div className="space-y-6">
      <StepProgressBar
        currentStep={currentStep}
        totalSteps={5}
        onStepClick={(step) => goToStep(step)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Step Body */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border">
            <CardContent className="p-6 sm:p-8">
              {currentStep === 1 && (
                <CountryStep
                  selectedCountry={selectedCountry}
                  onSelectCountry={(code) => setSelectedCountry(code)}
                />
              )}

              {currentStep === 2 && (
                <SectorStep
                  selectedSector={selectedSector}
                  onSelectSector={(sectorId) => setSelectedSector(sectorId)}
                />
              )}

              {currentStep === 3 && (
                <SubSectorStep
                  activeSector={activeSectorConfig}
                  selectedSubSector={selectedSubSector}
                  onSelectSubSector={(id) => setSelectedSubSector(id)}
                />
              )}

              {currentStep === 4 && (
                <ActivityStep
                  activeSector={activeSectorConfig}
                  inputs={inputs}
                  onInputChange={setInputValue}
                />
              )}

              {currentStep === 5 && (
                <CalculationResult
                  summary={calculationSummary}
                  countryName={countryData.name}
                  onSaveToDashboard={saveCalculationToDashboard}
                  onReset={() => goToStep(1)}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation Footer for steps 1-4 */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Previous Step
              </Button>

              <Button
                onClick={nextStep}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                {currentStep === 4 ? (
                  <>
                    Calculate Footprint
                    <CheckCircle2 className="w-4 h-4 ml-1.5" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Informational Sidebar */}
        <div className="lg:col-span-1">
          <InfoSidebar currentStep={currentStep} />
        </div>
      </div>
    </div>
  );
};
