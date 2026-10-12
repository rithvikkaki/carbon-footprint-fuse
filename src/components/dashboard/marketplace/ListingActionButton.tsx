import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MarketListing } from '@/contexts/CartonFootprintContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Loader2, Undo2, Ban } from 'lucide-react';

interface ListingActionButtonProps {
  listing: MarketListing;
  onBuy: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const ListingActionButton: React.FC<ListingActionButtonProps> = ({
  listing,
  onBuy,
  onCancel,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check if current authenticated user owns this listing
  const isOwner = Boolean(
    user && (
      user.id === listing.seller ||
      (user.walletAddress && user.walletAddress.toLowerCase() === listing.seller.toLowerCase()) ||
      (user.email && listing.seller.includes(user.email))
    )
  );

  const handleBuy = () => {
    setLoading(true);
    setTimeout(async () => {
      await onBuy(listing.id);
      setLoading(false);
    }, 400);
  };

  const handleCancel = () => {
    if (!onCancel) return;
    setLoading(true);
    setTimeout(async () => {
      await onCancel(listing.id);
      setLoading(false);
    }, 400);
  };

  if (isOwner) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleCancel}
        disabled={loading}
        className="border-amber-500/60 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold px-2.5 py-1 h-8"
        title="Cancel your listing and refund escrowed carbon credits"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
        ) : (
          <Undo2 className="w-3.5 h-3.5 mr-1" />
        )}
        Cancel & Refund
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleBuy}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1 h-8"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
      ) : (
        <ShoppingCart className="w-3.5 h-3.5 mr-1" />
      )}
      Buy Credits
    </Button>
  );
};
