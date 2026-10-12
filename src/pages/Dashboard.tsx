import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WalletSection } from '@/components/dashboard/WalletSection';
import { ActivityForm } from '@/components/dashboard/ActivityForm';
import { RewardsTab } from '@/components/dashboard/RewardsTab';
import { NetworkSection } from '@/components/dashboard/NetworkSection';
import { MarketplaceSection } from '@/components/dashboard/MarketplaceSection';
import { CarbonIntelligenceDashboard } from '@/components/analytics/CarbonIntelligenceDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Activity,
  ArrowLeftRight,
  Gift,
  Users2,
  Calendar,
  ShieldCheck,
  PlusCircle,
  FileText,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { activities } = useCarbonFootprint();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header with stats */}
      <DashboardHeader />

      {/* Main Feature Tabs */}
      <Tabs defaultValue="intelligence" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="intelligence" className="flex items-center gap-2 py-2 text-xs">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Intelligence</span>
          </TabsTrigger>

          <TabsTrigger value="wallet" className="flex items-center gap-2 py-2 text-xs">
            <Wallet className="w-4 h-4" />
            <span>Wallet & CCT</span>
          </TabsTrigger>

          <TabsTrigger value="activities" className="flex items-center gap-2 py-2 text-xs">
            <Activity className="w-4 h-4" />
            <span>Activities ({activities.length})</span>
          </TabsTrigger>

          <TabsTrigger value="marketplace" className="flex items-center gap-2 py-2 text-xs">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Marketplace</span>
          </TabsTrigger>

          <TabsTrigger value="rewards" className="flex items-center gap-2 py-2 text-xs">
            <Gift className="w-4 h-4" />
            <span>Eco Rewards</span>
          </TabsTrigger>

          <TabsTrigger value="network" className="flex items-center gap-2 py-2 text-xs col-span-2 sm:col-span-1">
            <Users2 className="w-4 h-4" />
            <span>Collaborations</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 0: Carbon Intelligence Dashboard */}
        <TabsContent value="intelligence" className="space-y-6">
          <CarbonIntelligenceDashboard />
        </TabsContent>

        {/* Tab 1: Wallet & Token Section */}
        <TabsContent value="wallet" className="space-y-6">
          <WalletSection />
        </TabsContent>

        {/* Tab 2: Activities & Form */}
        <TabsContent value="activities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ActivityForm />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Verified Activity Log</h3>
                  <p className="text-xs text-muted-foreground">Historical actions and calculations earning CCT tokens</p>
                </div>
                <Link to="/calculator">
                  <Button size="sm" variant="outline" className="text-xs">
                    <PlusCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    New Calculator Audit
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {activities.length === 0 ? (
                  <Card className="p-8 text-center text-xs text-muted-foreground">
                    No activities recorded yet. Run a calculator audit or log an activity to get started!
                  </Card>
                ) : (
                  activities.map((act) => (
                    <Card key={act.id} className="border-border hover:shadow-sm transition-shadow">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {act.category}
                            </Badge>
                            <Badge variant="success" className="text-[10px] flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              {act.status}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {act.date}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-foreground">
                            {act.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Offset reduction impact: <strong>{act.reductionKg.toLocaleString()} kg CO₂</strong>
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2 sm:p-0 rounded bg-muted/40 sm:bg-transparent">
                          <span className="text-[10px] text-muted-foreground">Awarded</span>
                          <span className="font-bold text-emerald-600 text-sm">
                            +{act.creditsEarned} CCT
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Marketplace Section */}
        <TabsContent value="marketplace" className="space-y-6">
          <MarketplaceSection />
        </TabsContent>

        {/* Tab 4: Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <RewardsTab />
        </TabsContent>

        {/* Tab 5: Corporate Collaborations Network */}
        <TabsContent value="network" className="space-y-6">
          <NetworkSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
