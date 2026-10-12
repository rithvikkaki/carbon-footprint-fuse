import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingDown,
  Award,
  Coins,
  CheckCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CalculationResultProps {
  summary: {
    transportAnnualKg: number;
    energyAnnualKg: number;
    industryAnnualKg: number;
    agricultureAnnualKg: number;
    totalAnnualKg: number;
    totalMetricTons: number;
    nationalAvgTons: number;
    globalAvgTons: number;
    potentialReductionTons: number;
    potentialCredits: number;
    rating: string;
  };
  countryName: string;
  onSaveToDashboard: () => void;
  onReset: () => void;
}

export const CalculationResult: React.FC<CalculationResultProps> = ({
  summary,
  countryName,
  onSaveToDashboard,
  onReset,
}) => {
  const comparisonPercent = Math.min(
    200,
    Math.round((summary.totalMetricTons / summary.nationalAvgTons) * 100)
  );

  const handleDownloadCertificate = () => {
    const cert = {
      title: "Verified ESG Carbon Footprint Audit Certificate",
      platform: "Carbon Footprint Fuse",
      certificateId: `CFF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      country: countryName,
      totalAnnualKg: summary.totalAnnualKg,
      totalMetricTons: summary.totalMetricTons,
      performanceRating: summary.rating,
      potentialReductionTons: summary.potentialReductionTons,
      awardedCarbonCredits: summary.potentialCredits,
      issuedAt: new Date().toISOString(),
      standards: "IPCC GHG Protocol & Polygon PoS Immutable Ledger",
      advisoryTeam: [
        "Rithvik Kaki (Lead Developer & Blockchain Strategist)",
        "Pragna Sai (Product Designer & Sustainability Consultant)",
        "Dr. Karthikeyan (Project Mentor & Academic Advisor)"
      ]
    };

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Carbon-Footprint-Fuse-Certificate-${countryName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 via-background to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Audit Completed • {countryName}
                </Badge>
                <Badge
                  className={
                    summary.rating === 'A+' || summary.rating === 'A'
                      ? 'bg-emerald-600'
                      : summary.rating === 'B'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }
                >
                  Rating {summary.rating}
                </Badge>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                {summary.totalMetricTons} <span className="text-xl font-medium text-muted-foreground">metric tons CO₂ / year</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Equivalent to {summary.totalAnnualKg.toLocaleString()} kg of greenhouse gas emissions annually.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto p-4 rounded-xl bg-card border shadow-sm">
              <span className="text-xs text-muted-foreground">Eligible CCT Reward</span>
              <div className="flex items-center gap-1.5 text-xl font-bold text-emerald-600">
                <Coins className="w-5 h-5" />
                +{summary.potentialCredits} CCT
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown and Benchmark comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sector Emissions Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Sector Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between py-1 font-medium">
                <span>Transportation</span>
                <span>{(summary.transportAnnualKg / 1000).toFixed(2)} t</span>
              </div>
              <Progress
                value={Math.min(100, (summary.transportAnnualKg / (summary.totalAnnualKg || 1)) * 100)}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between py-1 font-medium">
                <span>Household Energy</span>
                <span>{(summary.energyAnnualKg / 1000).toFixed(2)} t</span>
              </div>
              <Progress
                value={Math.min(100, (summary.energyAnnualKg / (summary.totalAnnualKg || 1)) * 100)}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between py-1 font-medium">
                <span>Industry & Operations</span>
                <span>{(summary.industryAnnualKg / 1000).toFixed(2)} t</span>
              </div>
              <Progress
                value={Math.min(100, (summary.industryAnnualKg / (summary.totalAnnualKg || 1)) * 100)}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between py-1 font-medium">
                <span>Agriculture & Land Use</span>
                <span>{(summary.agricultureAnnualKg / 1000).toFixed(2)} t</span>
              </div>
              <Progress
                value={Math.min(100, (summary.agricultureAnnualKg / (summary.totalAnnualKg || 1)) * 100)}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Benchmark Comparisons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Benchmark Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-lg border bg-muted/40 space-y-1.5">
              <div className="flex justify-between font-medium">
                <span>Your Baseline:</span>
                <span className="font-bold text-foreground">{summary.totalMetricTons} tons</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{countryName} Average:</span>
                <span>{summary.nationalAvgTons} tons</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Global Paris Agreement Target:</span>
                <span>~2.0 tons</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Versus {countryName} average:</span>
                <span className="font-semibold text-foreground">{comparisonPercent}%</span>
              </div>
              <Progress value={Math.min(100, comparisonPercent / 2)} className="h-2" />
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Actionable Reduction Target
              </div>
              <p className="text-[11px] leading-relaxed">
                By optimizing commute and switching to green electricity, you can abate ~{summary.potentialReductionTons} tons and earn continuous CCT tokens.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={onReset} className="w-full sm:w-auto text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Re-calculate
          </Button>

          <Button variant="outline" onClick={handleDownloadCertificate} className="w-full sm:w-auto text-xs">
            <Download className="w-3.5 h-3.5 mr-2 text-emerald-600" />
            Download ESG Certificate
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link to="/marketplace" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-2" />
              Offset on Marketplace
            </Button>
          </Link>

          <Button
            onClick={onSaveToDashboard}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Audit & Claim +{summary.potentialCredits} CCT
          </Button>
        </div>
      </div>
    </div>
  );
};
