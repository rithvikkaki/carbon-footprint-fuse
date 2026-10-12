import React, { useState } from 'react';
import { useCarbonFootprint, SustainableProduct } from '@/contexts/CartonFootprintContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductDetailsModal } from './ProductDetailsModal';
import { BuyProductModal } from './BuyProductModal';
import {
  Watch,
  Search,
  Sparkles,
  ShieldCheck,
  Leaf,
  ShoppingCart,
  Eye,
  Star,
  CheckCircle2,
  Package,
} from 'lucide-react';

export const SustainableProductsSection: React.FC = () => {
  const { products, productOrders } = useCarbonFootprint();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detailProduct, setDetailProduct] = useState<SustainableProduct | null>(null);
  const [buyProduct, setBuyProduct] = useState<SustainableProduct | null>(null);

  const categories = ['All', 'Watches', 'Lifestyle', 'Apparel', 'Accessories'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.materials.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sustainabilityClaims || []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const watchesCount = products.filter((p) => p.category === 'Watches').length;

  return (
    <div className="space-y-8">
      {/* Hero Banner for Eco Store */}
      <div className="rounded-2xl p-6 sm:p-8 border bg-gradient-to-br from-emerald-500/10 via-primary/5 to-teal-500/10 backdrop-blur relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <Watch className="w-3.5 h-3.5" />
            Curated Sustainable Watches & Circular Goods (Prototype Catalog)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Sustainable Products Store
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Curated prototype catalog showcasing sustainable horology (solar-powered, upcycled ocean waste, reclaimed barrel wood) and zero-waste lifestyle products. Eco-credentials and certifications illustrate target merchant compliance standards.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Modeled eco-design specifications</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Circular lifecycle documentation</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Simulated checkout & order history</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? 'eco-gradient-bg text-white shadow-sm'
                  : 'text-xs hover:bg-muted'
              }
            >
              {cat === 'Watches' && <Watch className="w-3.5 h-3.5 mr-1.5" />}
              {cat}
              {cat === 'Watches' && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-white/20 text-white">
                  {watchesCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search watches, materials, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-border/80 group">
            <div className="h-52 w-full overflow-hidden bg-muted relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground text-xs shadow-sm font-medium">
                  {product.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-emerald-600/90 hover:bg-emerald-600 text-white text-[11px] font-semibold gap-1">
                  <Leaf className="w-3 h-3" />
                  {product.stock} in stock
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2">
                <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{product.rating}</span>
                </div>
              </div>
            </div>

            <CardHeader className="p-4 pb-2">
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {product.seller}
              </div>
              <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                {product.name}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2 mt-1">
                {product.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-1 flex-1 space-y-3">
              <div className="p-2.5 rounded-lg bg-muted/60 border border-border/50 text-xs">
                <div className="flex items-start gap-1.5 text-foreground font-medium text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {product.sustainabilityClaims?.[0] || 'Verified eco-certified materials'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {(product.certifications || []).slice(0, 3).map((cert, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-2 border-t flex items-center justify-between bg-muted/20">
              <div>
                <div className="text-lg font-bold text-foreground">${product.priceUSD}</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {product.priceETH} ETH · {product.priceCCT} CCT
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  onClick={() => setDetailProduct(product)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Details
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs eco-gradient-bg text-white shadow-sm"
                  onClick={() => setBuyProduct(product)}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                  Buy
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 border rounded-xl bg-muted/20">
          <Watch className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
          <h4 className="text-base font-semibold">No products found</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      )}

      {/* Recent Orders Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-eco-green" />
                Your Sustainable Product Orders
              </CardTitle>
              <CardDescription className="text-xs">
                Audited fulfillment and carbon-neutral logistics tracking.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {productOrders.length} Completed Orders
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Order ID</TableHead>
                <TableHead className="text-xs">Product</TableHead>
                <TableHead className="text-xs">Paid Amount</TableHead>
                <TableHead className="text-xs">Method</TableHead>
                <TableHead className="text-xs">Shipping Address</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productOrders.map((order) => (
                <TableRow key={order.id} className="text-xs">
                  <TableCell className="font-mono font-medium">{order.id}</TableCell>
                  <TableCell className="font-semibold">{order.productName}</TableCell>
                  <TableCell className="font-bold">{order.pricePaid}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {order.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[150px]">
                    {order.shippingAddress}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProductDetailsModal
        product={detailProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onOpenBuyModal={(prod) => {
          setDetailProduct(null);
          setBuyProduct(prod);
        }}
      />

      <BuyProductModal
        product={buyProduct}
        isOpen={!!buyProduct}
        onClose={() => setBuyProduct(null)}
      />
    </div>
  );
};
