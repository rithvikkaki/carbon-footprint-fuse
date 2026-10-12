import React, { useState } from 'react';
import { SustainableProduct, useCarbonFootprint } from '@/contexts/CartonFootprintContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldCheck, Truck, Coins, CreditCard, Wallet } from 'lucide-react';

interface BuyProductModalProps {
  product: SustainableProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BuyProductModal: React.FC<BuyProductModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { buyProduct, credits, walletConnected } = useCarbonFootprint();
  const [paymentMethod, setPaymentMethod] = useState<'ETH' | 'USD' | 'CCT'>('USD');
  const [shippingAddress, setShippingAddress] = useState('142 Green Avenue, Eco City, CA 94103');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) return;

    setIsSubmitting(true);
    const success = buyProduct(product.id, paymentMethod, shippingAddress);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-eco-green border-eco-green/40">
              Direct Order
            </Badge>
            <span className="text-xs text-muted-foreground">{product.category}</span>
          </div>
          <DialogTitle className="text-lg font-bold">
            Purchase {product.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Sold by {product.seller}. Every item ships in carbon-neutral packaging.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePurchase} className="space-y-4 py-1 text-xs">
          {/* Product Summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-16 h-16 rounded-md object-cover border"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground leading-tight line-clamp-1">{product.name}</h4>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Materials: <span className="font-medium text-foreground">{product.materials}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-foreground">${product.priceUSD} USD</span>
                <span className="text-muted-foreground text-[11px]">({product.priceETH} ETH / {product.priceCCT} CCT)</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Select Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('USD')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-colors ${
                  paymentMethod === 'USD'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-semibold">USD Card (Demo)</span>
                <span className="text-[10px] text-muted-foreground">${product.priceUSD}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ETH')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-colors ${
                  paymentMethod === 'ETH'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <Wallet className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-semibold">Web3 (Demo)</span>
                <span className="text-[10px] text-muted-foreground">{product.priceETH} ETH</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CCT')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-colors ${
                  paymentMethod === 'CCT'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <Coins className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-[11px] font-semibold">Carbon CCT</span>
                <span className="text-[10px] text-muted-foreground">{product.priceCCT} CCT</span>
              </button>
            </div>

            {paymentMethod === 'CCT' && (
              <p className="text-[11px] text-muted-foreground">
                Your current balance: <span className="font-semibold text-foreground">{credits} CCT</span>
                {credits < product.priceCCT && (
                  <span className="text-amber-600 block">Insufficient balance. Complete activities or use Card/ETH.</span>
                )}
              </p>
            )}
            {paymentMethod !== 'CCT' && (
              <p className="text-[11px] text-muted-foreground">
                Payment gateway simulation active: orders are processed in sandbox demo mode.
              </p>
            )}
          </div>

          {/* Shipping Address */}
          <div className="space-y-1.5">
            <Label htmlFor="shipping-address" className="text-xs font-semibold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-muted-foreground" />
              Delivery Address (Demo Order)
            </Label>
            <Input
              id="shipping-address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter delivery address..."
              required
              className="text-xs"
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Sample dispatch logging (Physical shipping integration pending production logistics API)
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="eco-gradient-bg text-white gap-1.5"
              disabled={isSubmitting || (paymentMethod === 'CCT' && credits < product.priceCCT)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm & Pay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
