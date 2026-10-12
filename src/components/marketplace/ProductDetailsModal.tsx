import React from 'react';
import { SustainableProduct } from '@/contexts/CartonFootprintContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldCheck, Tag, ShoppingCart, Sparkles, Star } from 'lucide-react';

interface ProductDetailsModalProps {
  product: SustainableProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBuyModal: (product: SustainableProduct) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenBuyModal,
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            <div className="flex items-center text-amber-500 text-xs font-bold gap-1 ml-auto">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{product.rating} / 5.0</span>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            Brand / Artisan: {product.seller}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="h-48 w-full rounded-xl overflow-hidden border bg-muted relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/75 backdrop-blur-sm text-white border-0 text-xs font-bold">
                ${product.priceUSD} USD / {product.priceETH} ETH
              </Badge>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="p-3 rounded-lg border bg-muted/40 space-y-1.5">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Traceable Materials & Architecture:
            </h4>
            <p className="text-muted-foreground font-mono text-[11px]">
              {product.materials}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Sustainability Claims:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(product.sustainabilityClaims || []).map((claim, idx) => (
                <div key={idx} className="flex items-start gap-1.5 p-2 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{claim}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(product.certifications || []).map((cert, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] bg-background">
                {cert}
              </Badge>
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2 border-t">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-foreground">${product.priceUSD}</span>
            <span className="text-xs text-emerald-600 font-semibold">or {product.priceCCT} CCT</span>
          </div>

          <Button
            size="sm"
            onClick={() => {
              onClose();
              onOpenBuyModal(product);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            Proceed to Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
