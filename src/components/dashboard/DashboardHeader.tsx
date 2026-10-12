import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Badge } from '@/components/ui/badge';
import { Leaf, Award, Globe, ShieldCheck } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const { credits, activities } = useCarbonFootprint();

  const totalKgReduced = activities.reduce((acc, curr) => acc + (curr.reductionKg || 0), 0);
  const tonsReduced = (totalKgReduced / 1000).toFixed(2);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-lg">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/30 text-white border-emerald-400/40 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified Participant
            </Badge>
            <span className="text-xs text-emerald-100">
              {user?.organization || 'Individual Eco Citizen'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Climate Champion'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
            Track your emission reduction lifecycle, stake verified carbon tokens, and access decentralized green marketplace liquidity.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="text-[11px] text-emerald-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Token Balance
            </div>
            <div className="text-xl font-bold mt-1 text-white">{credits} <span className="text-xs font-normal">CCT</span></div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="text-[11px] text-emerald-200 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5" />
              CO₂ Reduced
            </div>
            <div className="text-xl font-bold mt-1 text-white">{tonsReduced} <span className="text-xs font-normal">tons</span></div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="text-[11px] text-emerald-200 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Audit Status
            </div>
            <div className="text-xl font-bold mt-1 text-emerald-300">Level 2 Active</div>
          </div>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
    </div>
  );
};
