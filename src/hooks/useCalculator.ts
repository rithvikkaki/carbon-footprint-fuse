import { useState, useMemo } from 'react';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { useToast } from '@/hooks/use-toast';
import { calculatorApi } from '@/lib/api';

export interface SectorConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  unit: string;
  subSectors: {
    id: string;
    name: string;
    unit: string;
    factorKgCo2: number;
    defaultVal: number;
    description: string;
  }[];
}

export const COUNTRIES = [
  { code: 'US', name: 'United States', gridMultiplier: 1.15, avgAnnualKg: 14800 },
  { code: 'IN', name: 'India', gridMultiplier: 1.05, avgAnnualKg: 1900 },
  { code: 'GB', name: 'United Kingdom', gridMultiplier: 0.75, avgAnnualKg: 5500 },
  { code: 'DE', name: 'Germany', gridMultiplier: 0.85, avgAnnualKg: 8200 },
  { code: 'JP', name: 'Japan', gridMultiplier: 0.90, avgAnnualKg: 8500 },
  { code: 'CN', name: 'China', gridMultiplier: 1.10, avgAnnualKg: 7600 },
  { code: 'BR', name: 'Brazil', gridMultiplier: 0.55, avgAnnualKg: 2400 },
  { code: 'CA', name: 'Canada', gridMultiplier: 0.95, avgAnnualKg: 14200 },
  { code: 'AU', name: 'Australia', gridMultiplier: 1.25, avgAnnualKg: 15100 },
];

export const SECTORS: SectorConfig[] = [
  {
    id: 'transportation',
    name: 'Transportation',
    description: 'Vehicle travel, public transit, and flight emissions',
    icon: 'Car',
    unit: 'km',
    subSectors: [
      { id: 'electric_rickshaw', name: 'Electric Rickshaw', unit: 'km', factorKgCo2: 0.03, defaultVal: 50, description: 'Eco-friendly urban electric 3-wheeler' },
      { id: 'car_gasoline', name: 'Car (Gasoline)', unit: 'km', factorKgCo2: 0.12, defaultVal: 150, description: 'Standard petrol internal combustion vehicle' },
      { id: 'two_wheeler', name: 'Two-Wheeler', unit: 'km', factorKgCo2: 0.08, defaultVal: 80, description: 'Motorcycles and commuter scooters' },
      { id: 'public_transit', name: 'Public Transit', unit: 'km', factorKgCo2: 0.05, defaultVal: 60, description: 'Shared municipal buses and metro systems' },
      { id: 'air_travel', name: 'Air Travel', unit: 'km', factorKgCo2: 0.20, defaultVal: 500, description: 'Commercial passenger flights' },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    description: 'Electricity generation, heating, and renewable installations',
    icon: 'Zap',
    unit: 'kWh',
    subSectors: [
      { id: 'solar', name: 'Solar', unit: 'kWh', factorKgCo2: 0.05, defaultVal: 150, description: 'Clean photovoltaic solar generation' },
      { id: 'wind', name: 'Wind', unit: 'kWh', factorKgCo2: 0.05, defaultVal: 100, description: 'Turbine renewable wind energy' },
      { id: 'coal', name: 'Coal', unit: 'kWh', factorKgCo2: 1.00, defaultVal: 200, description: 'Coal-fired baseline thermal electricity' },
      { id: 'natural_gas', name: 'Natural Gas', unit: 'kWh', factorKgCo2: 0.50, defaultVal: 120, description: 'Natural gas pipeline heating & power' },
      { id: 'hydroelectric', name: 'Hydroelectric', unit: 'kWh', factorKgCo2: 0.05, defaultVal: 80, description: 'Zero-emission water flow generation' },
    ],
  },
  {
    id: 'industry',
    name: 'Industry',
    description: 'Commercial manufacturing, extraction, and building operations',
    icon: 'Factory',
    unit: 'hours',
    subSectors: [
      { id: 'manufacturing', name: 'Manufacturing', unit: 'hours', factorKgCo2: 2.50, defaultVal: 40, description: 'Industrial equipment and component assembly' },
      { id: 'construction', name: 'Construction', unit: 'hours', factorKgCo2: 3.00, defaultVal: 30, description: 'Heavy machinery and site development' },
      { id: 'mining', name: 'Mining', unit: 'hours', factorKgCo2: 4.00, defaultVal: 20, description: 'Mineral extraction and processing' },
      { id: 'textile', name: 'Textile', unit: 'hours', factorKgCo2: 2.00, defaultVal: 25, description: 'Apparel and fabric manufacturing' },
      { id: 'food_processing', name: 'Food Processing', unit: 'hours', factorKgCo2: 2.00, defaultVal: 35, description: 'Packaged food and beverage processing' },
    ],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Crop farming, livestock management, and forestry operations',
    icon: 'Sprout',
    unit: 'acres',
    subSectors: [
      { id: 'crop_farming', name: 'Crop Farming', unit: 'acres', factorKgCo2: 1.50, defaultVal: 10, description: 'Arable crop cultivation and harvesting' },
      { id: 'livestock', name: 'Livestock', unit: 'acres', factorKgCo2: 5.00, defaultVal: 4, description: 'Pasture animal husbandry and grazing' },
      { id: 'aquaculture', name: 'Aquaculture', unit: 'acres', factorKgCo2: 2.50, defaultVal: 5, description: 'Managed fishery and aquatic cultivation' },
      { id: 'forestry', name: 'Forestry', unit: 'acres', factorKgCo2: 0.50, defaultVal: 8, description: 'Managed timberland and agroforestry' },
    ],
  },
];

export function useCalculator() {
  const { addActivity } = useCarbonFootprint();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [selectedSector, setSelectedSector] = useState<string>('transportation');
  const [selectedSubSector, setSelectedSubSector] = useState<string>('electric_rickshaw');

  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    SECTORS.forEach((sec) => {
      sec.subSectors.forEach((sub) => {
        init[sub.id] = sub.defaultVal;
      });
    });
    return init;
  });

  const countryData = useMemo(() => {
    return COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];
  }, [selectedCountry]);

  const activeSectorConfig = useMemo(() => {
    return SECTORS.find((s) => s.id === selectedSector) || SECTORS[0];
  }, [selectedSector]);

  const setInputValue = (subSectorId: string, val: number) => {
    setInputs((prev) => ({
      ...prev,
      [subSectorId]: Math.max(0, val),
    }));
  };

  // Footprint math (Annualized in kg CO2)
  const calculationSummary = useMemo(() => {
    let transportAnnual = 0;
    let energyAnnual = 0;
    let industryAnnual = 0;
    let agricultureAnnual = 0;

    // Transport (weekly * 52)
    SECTORS[0].subSectors.forEach((s) => {
      const val = inputs[s.id] || 0;
      transportAnnual += val * 52 * s.factorKgCo2;
    });

    // Energy (monthly * 12)
    SECTORS[1].subSectors.forEach((s) => {
      const val = inputs[s.id] || 0;
      energyAnnual += val * 12 * s.factorKgCo2;
    });

    // Industry (weekly * 52)
    SECTORS[2].subSectors.forEach((s) => {
      const val = inputs[s.id] || 0;
      industryAnnual += val * 52 * s.factorKgCo2;
    });

    // Agriculture (annual * 1)
    SECTORS[3].subSectors.forEach((s) => {
      const val = inputs[s.id] || 0;
      agricultureAnnual += val * s.factorKgCo2 * 100;
    });

    const totalAnnualKg = Math.max(0, Math.round(transportAnnual + energyAnnual + industryAnnual + agricultureAnnual));
    const totalMetricTons = +(totalAnnualKg / 1000).toFixed(2);
    const nationalAvgTons = +(countryData.avgAnnualKg / 1000).toFixed(2);
    const globalAvgTons = 4.8;

    const potentialReductionTons = +(totalMetricTons * 0.25).toFixed(2);
    const potentialCredits = Math.max(10, Math.round(potentialReductionTons * 12));

    let rating = 'B';
    if (totalMetricTons < nationalAvgTons * 0.6) rating = 'A+';
    else if (totalMetricTons < nationalAvgTons * 0.85) rating = 'A';
    else if (totalMetricTons < nationalAvgTons * 1.1) rating = 'B';
    else if (totalMetricTons < nationalAvgTons * 1.4) rating = 'C';
    else rating = 'D';

    return {
      transportAnnualKg: Math.round(transportAnnual),
      energyAnnualKg: Math.round(energyAnnual),
      industryAnnualKg: Math.round(industryAnnual),
      agricultureAnnualKg: Math.round(agricultureAnnual),
      totalAnnualKg,
      totalMetricTons,
      nationalAvgTons,
      globalAvgTons,
      potentialReductionTons,
      potentialCredits,
      rating,
    };
  }, [inputs, countryData]);

  const saveCalculationToDashboard = () => {
    const creditsToAward = calculationSummary.potentialCredits;
    addActivity({
      title: `Carbon Footprint Audit (${countryData.name} - ${activeSectorConfig.name})`,
      category: activeSectorConfig.name,
      reductionKg: Math.round(calculationSummary.potentialReductionTons * 1000),
      creditsEarned: creditsToAward,
      status: 'verified',
    });

    // Sync authoritative audit with backend
    calculatorApi.calculateAudit(
      selectedCountry,
      selectedSector,
      selectedSubSector,
      inputs
    ).catch(() => {});

    toast({
      title: 'Audit Saved to Dashboard!',
      description: `Calculated ${calculationSummary.totalMetricTons} tons CO₂/yr. Awarded +${creditsToAward} CCT credits!`,
    });
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(5, prev + 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));
  const goToStep = (step: number) => setCurrentStep(Math.max(1, Math.min(5, step)));

  return {
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
  };
}
