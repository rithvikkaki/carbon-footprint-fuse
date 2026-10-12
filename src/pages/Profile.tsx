import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Building, Wallet, Shield, KeyRound, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const { credits, walletConnected, walletAddress } = useCarbonFootprint();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || 'Eco Champion');
  const [organization, setOrganization] = useState(user?.organization || 'Green Innovators');
  const [country, setCountry] = useState(user?.country || 'United States');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, organization, country });
    setSaved(true);
    toast({
      title: 'Profile Updated',
      description: 'Your profile settings have been saved.',
    });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Account Profile & Security
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your personal details, corporate affiliation, and connected Web3 wallets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Overview card */}
        <Card className="md:col-span-1 border-border">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold text-xl mb-2">
              {name.substring(0, 2).toUpperCase()}
            </div>
            <CardTitle className="text-lg font-bold">{name}</CardTitle>
            <CardDescription className="text-xs">{user?.email}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>CCT Balance:</span>
                <span className="font-bold text-emerald-600">{credits} CCT</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Web3 Wallet:</span>
                <span className="font-semibold text-foreground">
                  {walletConnected ? 'Connected' : 'Not Linked'}
                </span>
              </div>
            </div>

            <Link to="/connect-wallet" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Wallet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Manage Wallet
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Right column: Editable Form */}
        <Card className="md:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Personal & Organization Details</CardTitle>
            <CardDescription className="text-xs">
              Update information displayed on your offset certificates and invoices.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name" className="text-xs font-medium">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-email" className="text-xs font-medium">
                  Registered Email
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    value={user?.email || ''}
                    disabled
                    className="pl-9 text-xs bg-muted/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-org" className="text-xs font-medium">
                    Organization / Company
                  </Label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="profile-org"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-country" className="text-xs font-medium">
                    Country
                  </Label>
                  <Input
                    id="profile-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                {saved ? <Check className="w-4 h-4 mr-1.5" /> : null}
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
