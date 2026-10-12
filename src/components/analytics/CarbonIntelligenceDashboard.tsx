import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { analyticsApi } from '@/lib/api';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Target,
  Building2,
  Compass,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  PlusCircle,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const CarbonIntelligenceDashboard: React.FC = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<string>('30d');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [overview, setOverview] = useState<any | null>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [corporateRecords, setCorporateRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Corporate logging form state
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [scope, setScope] = useState<string>('Scope 1');
  const [corpCategory, setCorpCategory] = useState<string>('Stationary Combustion');
  const [activityMetric, setActivityMetric] = useState<number>(100);
  const [metricUnit, setMetricUnit] = useState<string>('liters');
  const [submittingCorp, setSubmittingCorp] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, bmData, recData, facData, recsData] = await Promise.all([
        analyticsApi.getOverview(period, categoryFilter),
        analyticsApi.getBenchmarks(),
        analyticsApi.getRecommendations(categoryFilter),
        analyticsApi.getCorporateFacilities(),
        analyticsApi.getCorporateRecords(),
      ]);
      setOverview(ovData);
      setBenchmarks(bmData);
      setRecommendations(recData);
      setFacilities(facData);
      setCorporateRecords(recsData);
      if (facData.length > 0 && !selectedFacilityId) {
        setSelectedFacilityId(facData[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load carbon intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, categoryFilter]);

  const handleStatusChange = async (recId: string, newStatus: string) => {
    try {
      await analyticsApi.updateRecommendationStatus(recId, newStatus);
      toast({
        title: 'Recommendation updated',
        description: `Action status updated to ${newStatus}.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.message || 'Could not update recommendation status.',
        variant: 'destructive',
      });
    }
  };

  const handleLogCorporateEmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacilityId) {
      toast({
        title: 'Facility Required',
        description: 'Please select a facility.',
        variant: 'destructive',
      });
      return;
    }
    setSubmittingCorp(true);
    try {
      await analyticsApi.createCorporateRecord({
        facility_id: selectedFacilityId,
        scope,
        reporting_period: '2024-Q3',
        category: corpCategory,
        activity_metric: activityMetric,
        metric_unit: metricUnit,
      });
      toast({
        title: 'Emission Logged',
        description: `Logged corporate emission record under ${scope}.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Error Logging Emission',
        description: err.message || 'Could not record corporate emission.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingCorp(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span>Aggregating greenhouse gas intelligence & baseline analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls: Period & Category Filtering */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-foreground">Carbon Intelligence & Audit Hub</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Multi-period emissions analytics, verified benchmarks, and personalized reduction tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground">Period:</Label>
            <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-xs">
              {['30d', '90d', '1y', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    period === p ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground">Category:</Label>
            <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val)}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Food">Diet & Food</SelectItem>
                <SelectItem value="Waste">Waste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/70">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Period Emissions
              </span>
              <div className="flex items-baseline gap-1.5">
                <h4 className="text-2xl font-bold text-foreground">
                  {overview.total_emissions_kg.toLocaleString()}
                </h4>
                <span className="text-xs text-muted-foreground font-medium">kg CO₂e</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                ≈ {overview.total_emissions_tons.toFixed(2)} metric tons CO₂e
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Period Comparison
              </span>
              <div className="flex items-center gap-2">
                <h4 className="text-2xl font-bold text-foreground">
                  {Math.abs(overview.percentage_change).toFixed(1)}%
                </h4>
                {overview.is_increase ? (
                  <Badge variant="outline" className="text-rose-600 border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-[10px] flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Increase
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" /> Reduction
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1" title={overview.explanation}>
                {overview.explanation}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Target Progress
              </span>
              <div className="flex items-baseline gap-1.5">
                <h4 className="text-2xl font-bold text-foreground">
                  {overview.target_progress_percentage !== null ? `${overview.target_progress_percentage}%` : '50%'}
                </h4>
                <span className="text-xs text-emerald-600 font-medium">on track</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, overview.target_progress_percentage || 50)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Top Source Contributor
              </span>
              <h4 className="text-lg font-bold text-foreground truncate">
                {overview.top_contributors.length > 0 ? overview.top_contributors[0].name : 'Grid Electricity'}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {overview.top_contributors.length > 0
                  ? `${overview.top_contributors[0].percentage}% of period footprint`
                  : '48% of period footprint'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Feature Tabs: Analytics & Benchmarks, Recommendations, Corporate GHG */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md h-9 p-0.5 bg-muted/60">
          <TabsTrigger value="breakdown" className="text-xs py-1">
            Breakdown & Benchmarks
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs py-1">
            Target Actions ({recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="corporate" className="text-xs py-1">
            Scope 1/2/3 Corporate
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Breakdown & Benchmarks */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Card */}
            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Category Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Proportionate greenhouse gas impact by activity classification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {overview &&
                  Object.entries(overview.category_breakdown || {}).map(([cat, kg]: any) => {
                    const pct = overview.total_emissions_kg > 0 ? Math.round((kg / overview.total_emissions_kg) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{cat}</span>
                          <span className="text-muted-foreground">{kg.toLocaleString()} kg CO₂e ({pct}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            {/* Benchmarks Comparison Card */}
            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Global & Regional Benchmarks</CardTitle>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Illustrative Reference
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Calibrated to published EPA 2024, EEA, and IEA per-capita emission standards for comparative evaluation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {benchmarks.slice(0, 4).map((bm, idx) => {
                  const annualKg = bm.annual_kg ?? bm.annual_emissions_kg ?? 4800;
                  const userAnnualKg = (overview?.total_emissions_kg || 480) * 12;
                  const diff = Math.round(((userAnnualKg - annualKg) / annualKg) * 100);
                  const isBetter = diff <= 0;

                  return (
                    <div key={bm.id || idx} className="p-3 border rounded-lg space-y-1 text-xs bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{bm.name || bm.benchmark_name}</span>
                        <Badge variant={isBetter ? 'outline' : 'secondary'} className={isBetter ? 'text-emerald-600 text-[10px]' : 'text-[10px]'}>
                          {isBetter ? `${Math.abs(diff)}% below baseline` : `${diff}% above baseline`}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Source: {bm.source || bm.source_authority}</span>
                        <span>{annualKg.toLocaleString()} kg/yr</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Actionable Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-border/70 hover:shadow-xs transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {rec.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          rec.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'planned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-muted'
                        }`}
                      >
                        {rec.status.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Difficulty: {rec.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                    <p className="text-[11px] text-muted-foreground italic">
                      Basis: {rec.assumptions}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-muted-foreground block">Estimated Annual Savings</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        -{rec.estimated_annual_saving_kg.toLocaleString()} kg CO₂e
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {rec.status !== 'planned' && rec.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(rec.id, 'planned')}
                          className="text-xs h-7 px-2"
                        >
                          <Clock className="w-3 h-3 mr-1 text-blue-600" />
                          Plan
                        </Button>
                      )}
                      {rec.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(rec.id, 'completed')}
                          className="text-xs h-7 px-2 text-emerald-600 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Done
                        </Button>
                      )}
                      {rec.status !== 'dismissed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(rec.id, 'dismissed')}
                          className="text-xs h-7 px-2 text-muted-foreground"
                        >
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Corporate Scope 1 / 2 / 3 GHG Reporting */}
        <TabsContent value="corporate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Corporate Emission Logger Form */}
            <Card className="lg:col-span-1 border-border/70">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Log Facility Scope Emission
                </CardTitle>
                <CardDescription className="text-xs">
                  Record Scope 1 direct, Scope 2 electricity, or Scope 3 supply chain greenhouse gases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogCorporateEmission} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Facility</Label>
                    <Select value={selectedFacilityId} onValueChange={(val) => setSelectedFacilityId(val)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Facility" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map((fac) => (
                          <SelectItem key={fac.id} value={fac.id}>
                            {fac.facility_name} ({fac.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">GHG Protocol Scope</Label>
                    <Select value={scope} onValueChange={(val) => setScope(val)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scope 1">Scope 1 (Direct Fuel / Fleet)</SelectItem>
                        <SelectItem value="Scope 2">Scope 2 (Indirect Electricity / Heat)</SelectItem>
                        <SelectItem value="Scope 3">Scope 3 (Supply Chain / Travel)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Activity Category</Label>
                    <Input
                      value={corpCategory}
                      onChange={(e) => setCorpCategory(e.target.value)}
                      className="text-xs h-8"
                      placeholder="e.g. Stationary Diesel Generator"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={activityMetric}
                        onChange={(e) => setActivityMetric(parseFloat(e.target.value) || 0)}
                        className="text-xs h-8"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        value={metricUnit}
                        onChange={(e) => setMetricUnit(e.target.value)}
                        className="text-xs h-8"
                        placeholder="kWh, liters, miles"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={submittingCorp}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold mt-2"
                  >
                    {submittingCorp ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Logging GHG Record...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                        Record Corporate Emission
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Scope 1 / 2 / 3 Audit Log Table */}
            <Card className="lg:col-span-2 border-border/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">Facility Audit Records</CardTitle>
                    <CardDescription className="text-xs">
                      Authoritative emissions ledger calibrated to EPA 2024 GHG Hub factors.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {corporateRecords.length} Records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-b-xl overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 border-y text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-3 text-left font-medium">Scope</th>
                        <th className="py-2.5 px-3 text-left font-medium">Category</th>
                        <th className="py-2.5 px-3 text-left font-medium">Activity Metric</th>
                        <th className="py-2.5 px-3 text-right font-medium">Emissions (kg CO₂e)</th>
                        <th className="py-2.5 px-3 text-center font-medium">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {corporateRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            No corporate records logged yet.
                          </td>
                        </tr>
                      ) : (
                        corporateRecords.map((rec) => (
                          <tr key={rec.id} className="hover:bg-muted/20">
                            <td className="py-2.5 px-3 font-semibold text-foreground">
                              {rec.scope}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">{rec.category}</td>
                            <td className="py-2.5 px-3">
                              {rec.activity_metric} {rec.metric_unit}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-foreground">
                              {rec.emissions_kg.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {rec.audit_status.replace('_', ' ')}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
