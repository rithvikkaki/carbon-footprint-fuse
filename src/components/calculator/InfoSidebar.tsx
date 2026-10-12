import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lightbulb, Info, Award, HelpCircle } from 'lucide-react';

interface InfoSidebarProps {
  currentStep: number;
}

export const InfoSidebar: React.FC<InfoSidebarProps> = ({ currentStep }) => {
  return (
    <div className="space-y-4">
      <Card className="border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-sm font-semibold">Did You Know?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed">
          {currentStep === 1 && (
            <p>
              Your regional electric grid emission intensity varies by up to <strong>700%</strong> depending on reliance on coal vs. hydro and nuclear energy.
            </p>
          )}
          {currentStep === 2 && (
            <p>
              Personal transport and home heating/cooling represent more than <strong>60%</strong> of typical domestic greenhouse gas emissions in developed economies.
            </p>
          )}
          {currentStep === 3 && (
            <p>
              Switching from an internal combustion engine to an EV combined with green charging saves approximately <strong>2.8 metric tons</strong> of CO₂ each year.
            </p>
          )}
          {currentStep === 4 && (
            <p>
              Every 100 kg of CO₂ emission you prevent or offset qualifies for verified Carbon Credits Token (CCT) minting on the EcoFuse ledger.
            </p>
          )}
          {currentStep === 5 && (
            <p>
              Saving your audit to the dashboard automatically verifies your reduction and deposits initial reward tokens into your connected wallet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-foreground">
            <Award className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-sm font-semibold">CCT Incentive Rewards</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-muted-foreground">
          <div className="flex justify-between items-center py-1 border-b">
            <span>Audit completion</span>
            <span className="font-semibold text-emerald-600">+15 to +50 CCT</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b">
            <span>Verified 500kg reduction</span>
            <span className="font-semibold text-emerald-600">+50 CCT</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>Peer marketplace trade</span>
            <span className="font-semibold text-emerald-600">Zero fee</span>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-xl border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p>
          Need assistance or corporate scope-3 calculation? Check the <a href="/about#faq" className="text-emerald-600 underline">FAQ section</a> or connect with our support engineers.
        </p>
      </div>
    </div>
  );
};
