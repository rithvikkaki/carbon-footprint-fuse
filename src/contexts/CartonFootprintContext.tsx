import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  marketplaceApi,
  productsApi,
  rewardsApi,
  collaborationsApi,
  calculatorApi,
  authApi,
  getAuthToken,
} from '@/lib/api';

export interface Activity {
  id: string;
  title: string;
  category: string;
  date: string;
  reductionKg: number;
  creditsEarned: number;
  status: 'verified' | 'pending';
}

export interface MarketListing {
  id: string;
  seller: string;
  amount: number; // in CCT
  pricePerCredit: number; // in USD
  pricePerCreditETH: number; // in ETH
  project: string;
  country: string;
  type: 'sale' | 'purchase';
  date: string;
  batchId?: string;
  batchNumber?: string;
  batch?: any;
}

export interface CreditTransaction {
  id: string;
  txHash: string;
  type: 'Buy' | 'Sell' | 'Mint' | 'Burn';
  amountCCT: number;
  pricePerCredit: number;
  priceETH: number;
  counterparty: string;
  date: string;
  status: 'Confirmed' | 'Pending';
}

export interface SustainableProduct {
  id: string;
  name: string;
  category: 'Watches' | 'Lifestyle' | 'Apparel' | 'Accessories';
  priceUSD: number;
  priceETH: number;
  priceCCT: number;
  seller: string;
  description: string;
  sustainabilityClaims: string[];
  materials: string;
  stock: number;
  rating: number;
  imageUrl: string;
  certifications: string[];
}

export interface ProductOrder {
  id: string;
  productId: string;
  productName: string;
  buyer: string;
  pricePaid: string;
  paymentMethod: 'ETH' | 'USD' | 'CCT';
  shippingAddress: string;
  date: string;
  status: 'Confirmed' | 'Shipped' | 'Delivered';
}

export interface Reward {
  id: string;
  title: string;
  category: string;
  cost: number; // in CCT
  provider: string;
  description: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  title: string;
  costCCT: number;
  voucherCode: string;
  date: string;
}

export interface CompanyPartner {
  id: string;
  name: string;
  industry: string;
  tier: 'Tier 1 Supplier' | 'Tier 2 Supplier' | 'Direct Corporate Partner';
  location: string;
  emissionsReduced: string;
  description: string;
  connected: boolean;
  website: string;
}

export interface CollaborationProposal {
  id: string;
  partnerId: string;
  partnerName: string;
  scope: string;
  proposedBy: string;
  message: string;
  date: string;
  status: 'Connected' | 'Under Review';
}

interface CarbonFootprintContextType {
  credits: number;
  walletConnected: boolean;
  walletAddress: string;
  activities: Activity[];
  marketListings: MarketListing[];
  creditTransactions: CreditTransaction[];
  products: SustainableProduct[];
  productOrders: ProductOrder[];
  rewards: Reward[];
  rewardRedemptions: RewardRedemption[];
  partners: CompanyPartner[];
  collaborationProposals: CollaborationProposal[];
  addCredits: (amount: number, reason?: string) => void;
  deductCredits: (amount: number, reason?: string) => boolean;
  connectWallet: (address?: string) => Promise<void>;
  disconnectWallet: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'date'>) => void;
  addMarketListing: (listing: Omit<MarketListing, 'id' | 'date' | 'seller'>) => Promise<void> | void;
  buyCreditsFromListing: (listingId: string) => Promise<boolean> | boolean;
  cancelMarketListing: (listingId: string) => Promise<boolean> | boolean;
  buyProduct: (productId: string, paymentMethod: 'ETH' | 'USD' | 'CCT', shippingAddress: string) => Promise<boolean> | boolean;
  redeemReward: (rewardId: string) => Promise<boolean> | boolean;
  togglePartnerConnection: (partnerId: string) => void;
  proposeCollaboration: (partnerId: string, scope: string, message: string) => Promise<void> | void;
}

const initialActivities: Activity[] = [
  {
    id: 'act-1',
    title: 'Solar Panel Transition (Residential)',
    category: 'Energy',
    date: '2026-10-08',
    reductionKg: 420,
    creditsEarned: 42,
    status: 'verified',
  },
  {
    id: 'act-2',
    title: 'Electric Commute Routine (1,200 km)',
    category: 'Transportation',
    date: '2026-10-04',
    reductionKg: 210,
    creditsEarned: 21,
    status: 'verified',
  },
  {
    id: 'act-3',
    title: 'Zero Waste Living Initiative',
    category: 'Waste',
    date: '2026-09-29',
    reductionKg: 95,
    creditsEarned: 9.5,
    status: 'verified',
  },
];

const initialListings: MarketListing[] = [
  {
    id: 'list-1',
    seller: '0x32A4...88F1',
    amount: 150,
    pricePerCredit: 12.5,
    pricePerCreditETH: 0.0039,
    project: 'Amazon Rainforest Afforestation Block #44',
    country: 'Brazil',
    type: 'sale',
    date: '2026-10-09',
  },
  {
    id: 'list-2',
    seller: '0x99B1...12C0',
    amount: 80,
    pricePerCredit: 11.8,
    pricePerCreditETH: 0.0037,
    project: 'Nordic Offshore Wind Park Generation',
    country: 'Denmark',
    type: 'sale',
    date: '2026-10-08',
  },
  {
    id: 'list-3',
    seller: '0x54F8...009A',
    amount: 220,
    pricePerCredit: 13.0,
    pricePerCreditETH: 0.0041,
    project: 'Biochar Soil Regeneration & Sequestration',
    country: 'Kenya',
    type: 'sale',
    date: '2026-10-07',
  },
  {
    id: 'list-4',
    seller: '0x71C8...4982',
    amount: 100,
    pricePerCredit: 12.2,
    pricePerCreditETH: 0.0038,
    project: 'Miyawaki Urban Afforestation Corridor',
    country: 'India',
    type: 'sale',
    date: '2026-10-06',
  },
];

const initialCreditTransactions: CreditTransaction[] = [
  {
    id: 'tx-101',
    txHash: '0x8f4d7b2e9c1a53f0842e617d93a84b025e19c372f841c9b2e04719d3f58a1204',
    type: 'Buy',
    amountCCT: 50,
    pricePerCredit: 12.0,
    priceETH: 0.187,
    counterparty: '0x32A4...88F1',
    date: '2026-10-10',
    status: 'Confirmed',
  },
  {
    id: 'tx-102',
    txHash: '0x1a7c4f028e9d3b5162a84e037f91c258d406a183e29f074b6c813e59a047d192',
    type: 'Mint',
    amountCCT: 42,
    pricePerCredit: 12.5,
    priceETH: 0.164,
    counterparty: 'EcoFuse Proof-of-Reduction Oracle',
    date: '2026-10-08',
    status: 'Confirmed',
  },
];

const initialProducts: SustainableProduct[] = [
  {
    id: 'prod-watch-1',
    name: 'Solios Solar-Powered Recycled Steel Watch',
    category: 'Watches',
    priceUSD: 290,
    priceETH: 0.091,
    priceCCT: 24,
    seller: 'Solios Horology (Certified B-Corp)',
    description: 'High-precision solar timepiece with invisible cells that charge under natural or artificial light. Never requires battery replacement.',
    sustainabilityClaims: [
      'Eliminates disposable watch battery waste completely',
      'Case crafted from 100% recycled 316L stainless steel',
      'Certified solvent-free vegan eco-leather strap',
      '1 tree planted per watch via OneTreePlanted'
    ],
    materials: 'Recycled 316L stainless steel, solar dial, sapphire crystal, eco-vegan micro-leather',
    stock: 14,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    certifications: ['Certified B Corporation', 'RoHS Compliant', 'EcoVadis Gold']
  },
  {
    id: 'prod-watch-2',
    name: 'Awake Ocean Plastic Automatic Diver',
    category: 'Watches',
    priceUSD: 340,
    priceETH: 0.106,
    priceCCT: 28,
    seller: 'Awake Concept Studios (Paris)',
    description: 'Mechanical diving watch with a high-resistance case produced entirely from certified upcycled ocean marine plastics.',
    sustainabilityClaims: [
      'Recycled Ocean Bound Plastic (OBP) composite case',
      'Japanese automatic mechanical movement (zero batteries)',
      '100% recycled PET textile strap woven from ocean waste',
      'FSC certified biodegradable shipping box'
    ],
    materials: 'Ocean bound composite, Miyota automatic caliber, mineral glass, recycled nylon',
    stock: 9,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    certifications: ['Ocean Bound Plastic Certified', 'Zero Single-Use Plastic Supply']
  },
  {
    id: 'prod-watch-3',
    name: 'Nordgreen Pioneer Minimalist Chronograph',
    category: 'Watches',
    priceUSD: 265,
    priceETH: 0.083,
    priceCCT: 22,
    seller: 'Nordgreen Copenhagen',
    description: 'Red Dot Design Award winning chronograph manufactured with carbon neutral supply chains and ethical European assembly.',
    sustainabilityClaims: [
      'Carbon-neutral certified international logistics',
      'Responsibly sourced recycled metal casings',
      'Partnership provides 2 months clean water in CAR with each order'
    ],
    materials: 'Surgical stainless steel, Italian vegetable-tanned microfiber strap, domed sapphire glass',
    stock: 18,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    certifications: ['Certified B Corporation', 'Climate Neutral Verified']
  },
  {
    id: 'prod-watch-4',
    name: 'Original Grain FSC Reclaimed Wood Chrono',
    category: 'Watches',
    priceUSD: 295,
    priceETH: 0.092,
    priceCCT: 25,
    seller: 'Original Grain Craft Works',
    description: 'Handcrafted timepiece incorporating authenticated reclaimed oak from decommissioned barrels and sustainable forestry.',
    sustainabilityClaims: [
      'FSC-certified timber sourcing',
      'Zero toxic stains or heavy metal chemical dyes',
      'Trees for the Future partnership'
    ],
    materials: 'Reclaimed American oak, matte black 316L steel, mineral crystal',
    stock: 7,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=600&q=80',
    certifications: ['FSC Certified Wood', 'Trees for the Future Verified']
  },
  {
    id: 'prod-life-1',
    name: 'EcoVibe Organic Industrial Hemp Backpack',
    category: 'Lifestyle',
    priceUSD: 85,
    priceETH: 0.027,
    priceCCT: 7,
    seller: 'EcoVibe Supply Co.',
    description: 'Rugged weather-resistant daypack constructed from unbleached natural hemp fiber. Uses 80% less water than industrial cotton.',
    sustainabilityClaims: [
      'Zero synthetic pesticides or petrochemical herbicides',
      '100% natural biodegradable canvas body',
      'Recycled solid brass buckles'
    ],
    materials: '100% organic unbleached hemp canvas, vegetable tanned accents',
    stock: 35,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    certifications: ['OEKO-TEX Standard 100', 'Fair Wear Foundation']
  },
  {
    id: 'prod-life-2',
    name: 'Klean Kanteen 90% Recycled Steel Vacuum Flask',
    category: 'Lifestyle',
    priceUSD: 42,
    priceETH: 0.013,
    priceCCT: 3.5,
    seller: 'Klean Kanteen (Certified B-Corp)',
    description: 'Double-wall vacuum insulated water canister that keeps drinks cold for 50 hours, made with post-consumer recycled steel.',
    sustainabilityClaims: [
      '90% post-consumer recycled 18/8 food-grade stainless steel',
      'Lifetime durability guarantee prevents thousands of single-use bottles',
      '1% for the Planet founding member'
    ],
    materials: 'Recycled 18/8 stainless steel, BPA-free silicone seal',
    stock: 50,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    certifications: ['Certified B Corp', '1% For The Planet', 'Climate Neutral']
  }
];

const initialRewards: Reward[] = [
  {
    id: 'rew-1',
    title: 'Patagonia Worn Wear $50 Gear Repair Voucher',
    category: 'Lifestyle',
    cost: 15,
    provider: 'Patagonia Outdoor Gear',
    description: 'Redeem for official garments maintenance, hardware replacement, and seam repair to extend equipment lifespan.',
  },
  {
    id: 'rew-2',
    title: 'Lime Urban E-Bike 30-Day Commute Pass',
    category: 'Mobility',
    cost: 20,
    provider: 'Lime Micro-Mobility Network',
    description: 'Unlimited unlocks and 30 minutes daily zero-emission e-bike and scooter commuting across 120 global cities.',
  },
  {
    id: 'rew-3',
    title: 'OneTreePlanted 25 Native Saplings Certificate',
    category: 'Restoration',
    cost: 10,
    provider: 'OneTreePlanted Global Forest Project',
    description: 'Funds planting of 25 indigenous trees in critically deforested ecosystems with GPS coordinate tracking.',
  },
  {
    id: 'rew-4',
    title: 'Eurail Global Train Travel 25% Discount Code',
    category: 'Travel',
    cost: 35,
    provider: 'Eurail Group Community',
    description: '25% discount voucher on continuous cross-border European rail passes, substituting short-haul flights.',
  },
  {
    id: 'rew-5',
    title: 'Lush Fresh Handmade Cosmetics $30 Eco-Pack',
    category: 'Lifestyle',
    cost: 12,
    provider: 'Lush Cosmetics',
    description: 'Package-free solid shampoo, body bars, and ethical fair-trade botanicals with zero landfill footprint.',
  },
  {
    id: 'rew-6',
    title: 'Tier Mobility 100 Free Ride Minutes Bundle',
    category: 'Mobility',
    cost: 8,
    provider: 'Tier Climate Mobility',
    description: 'Zero-emission electric scooter credits valid across municipal bike corridors in 80 cities worldwide.',
  },
  {
    id: 'rew-7',
    title: 'The Ocean Cleanup Marine Interceptor Adoption',
    category: 'Restoration',
    cost: 25,
    provider: 'The Ocean Cleanup Foundation',
    description: 'Funds extraction and mechanical processing of 50 kg river plastic waste before ocean entry.',
  },
  {
    id: 'rew-8',
    title: 'Sleeper Train Cross-Country Berthing Pass',
    category: 'Travel',
    cost: 40,
    provider: 'Nightjet / European Sleeper',
    description: 'Direct sleeper cabin discount voucher connecting European capitals with 90% lower CO₂ than flying.',
  },
];

const initialPartners: CompanyPartner[] = [
  {
    id: '1',
    name: 'GreenTech Innovations',
    industry: 'Technology',
    tier: 'Tier 1 Supplier',
    location: 'Munich, Germany',
    emissionsReduced: '14,200 metric tons/yr',
    description: 'Collaborating on sustainable software integration, low-power datacenters, and carbon accounting APIs.',
    connected: true,
    website: 'https://greentechinnovations.example.org',
  },
  {
    id: '2',
    name: 'EcoTransport Ltd',
    industry: 'Transportation',
    tier: 'Tier 1 Supplier',
    location: 'Austin, TX, USA',
    emissionsReduced: '22,400 metric tons/yr',
    description: 'Seeking collaboration for developing sustainable logistics, electric fleet routes, and multimodal transit hubs.',
    connected: false,
    website: 'https://ecotransport.example.org',
  },
  {
    id: '3',
    name: 'Sustainable Retail Co',
    industry: 'Retail',
    tier: 'Tier 2 Supplier',
    location: 'London, UK',
    emissionsReduced: '9,800 metric tons/yr',
    description: 'Looking for partners to develop carbon neutral supply chains, zero-waste packaging, and consumer return loops.',
    connected: false,
    website: 'https://sustainableretail.example.org',
  },
  {
    id: '4',
    name: 'Green Buildings Inc',
    industry: 'Construction',
    tier: 'Tier 1 Supplier',
    location: 'Tokyo, Japan',
    emissionsReduced: '35,100 metric tons/yr',
    description: 'Seeking partners for sustainable construction materials, embodied carbon reductions, and energy-efficient architecture.',
    connected: false,
    website: 'https://greenbuildings.example.org',
  },
  {
    id: '5',
    name: 'EcoHealth Solutions',
    industry: 'Healthcare',
    tier: 'Tier 2 Supplier',
    location: 'Stockholm, Sweden',
    emissionsReduced: '6,700 metric tons/yr',
    description: 'Looking for collaborators to reduce carbon footprints in medical devices, healthcare clinics, and pharmaceutical shipping.',
    connected: false,
    website: 'https://ecohealth.example.org',
  },
  {
    id: '6',
    name: 'Sustainable Farming Collective',
    industry: 'Agriculture',
    tier: 'Direct Corporate Partner',
    location: 'Nairobi, Kenya',
    emissionsReduced: '18,500 metric tons/yr',
    description: 'Seeking partners for regenerative agriculture projects, soil carbon sequestration, and verified rural credit staking.',
    connected: true,
    website: 'https://sustainablefarming.example.org',
  },
];

const CarbonFootprintContext = createContext<CarbonFootprintContextType | undefined>(undefined);

export const CarbonFootprintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('ecofuse_credits');
    return saved ? parseFloat(saved) : 185;
  });

  const [walletConnected, setWalletConnected] = useState<boolean>(() => {
    return localStorage.getItem('ecofuse_wallet_connected') === 'true';
  });

  const [walletAddress, setWalletAddress] = useState<string>(() => {
    return localStorage.getItem('ecofuse_wallet_address') || '0x71C83B927a488e02b8E...4982';
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('ecofuse_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [marketListings, setMarketListings] = useState<MarketListing[]>(() => {
    const saved = localStorage.getItem('ecofuse_listings');
    return saved ? JSON.parse(saved) : initialListings;
  });

  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => {
    const saved = localStorage.getItem('ecofuse_credit_txs');
    return saved ? JSON.parse(saved) : initialCreditTransactions;
  });

  const [products, setProducts] = useState<SustainableProduct[]>(() => {
    const saved = localStorage.getItem('ecofuse_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [productOrders, setProductOrders] = useState<ProductOrder[]>(() => {
    const saved = localStorage.getItem('ecofuse_product_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [rewards, setRewards] = useState<Reward[]>(initialRewards);

  const [rewardRedemptions, setRewardRedemptions] = useState<RewardRedemption[]>(() => {
    const saved = localStorage.getItem('ecofuse_redemptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [partners, setPartners] = useState<CompanyPartner[]>(() => {
    const saved = localStorage.getItem('ecofuse_partners');
    return saved ? JSON.parse(saved) : initialPartners;
  });

  const [collaborationProposals, setCollaborationProposals] = useState<CollaborationProposal[]>(() => {
    const saved = localStorage.getItem('ecofuse_proposals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ecofuse_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('ecofuse_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('ecofuse_listings', JSON.stringify(marketListings));
  }, [marketListings]);

  useEffect(() => {
    localStorage.setItem('ecofuse_credit_txs', JSON.stringify(creditTransactions));
  }, [creditTransactions]);

  useEffect(() => {
    localStorage.setItem('ecofuse_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ecofuse_product_orders', JSON.stringify(productOrders));
  }, [productOrders]);

  useEffect(() => {
    localStorage.setItem('ecofuse_redemptions', JSON.stringify(rewardRedemptions));
  }, [rewardRedemptions]);

  useEffect(() => {
    localStorage.setItem('ecofuse_partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('ecofuse_proposals', JSON.stringify(collaborationProposals));
  }, [collaborationProposals]);

  useEffect(() => {
    localStorage.setItem('ecofuse_wallet_connected', walletConnected ? 'true' : 'false');
    localStorage.setItem('ecofuse_wallet_address', walletAddress);
  }, [walletConnected, walletAddress]);

  // Synchronize with backend API on mount if online
  useEffect(() => {
    productsApi.getProducts().then((serverProds) => {
      if (serverProds && serverProds.length > 0) {
        setProducts(
          serverProds.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            priceUSD: p.price_usd ?? p.priceUSD ?? 0,
            priceETH: p.price_eth ?? p.priceETH ?? 0,
            priceCCT: p.price_cct ?? p.priceCCT ?? 0,
            seller: p.seller || '',
            description: p.description || '',
            sustainabilityClaims: Array.isArray(p.sustainability_claims)
              ? p.sustainability_claims
              : Array.isArray(p.sustainabilityClaims)
              ? p.sustainabilityClaims
              : [],
            materials: p.materials || '',
            stock: p.stock ?? 0,
            rating: p.rating ?? 5.0,
            imageUrl: p.image_url ?? p.imageUrl ?? '',
            certifications: Array.isArray(p.certifications) ? p.certifications : [],
          }))
        );
      }
    }).catch(() => {});

    rewardsApi.getRewards().then((serverRewards) => {
      if (serverRewards && serverRewards.length > 0) {
        setRewards(
          serverRewards.map((r: any) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            cost: r.cost_cct,
            provider: r.provider,
            description: r.description,
          }))
        );
      }
    }).catch(() => {});

    // If authenticated, synchronize authoritative credits from server user profile
    const token = getAuthToken();
    if (token) {
      authApi.getMe().then((me) => {
        if (me && typeof me.credit_balance === 'number') {
          setCredits(me.credit_balance);
        }
      }).catch(() => {});
    }

    marketplaceApi.getListings().then((serverListings) => {
      if (serverListings && serverListings.length > 0) {
        const mapped: MarketListing[] = serverListings.map((l: any) => ({
          id: l.id,
          seller: l.seller_address || l.seller_id,
          amount: l.amount,
          pricePerCredit: l.price_per_credit,
          pricePerCreditETH: l.price_per_credit_eth,
          project: l.project,
          country: l.country,
          type: 'sale',
          date: (l.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
          batchId: l.batch_id,
          batchNumber: l.batch?.batch_number,
          batch: l.batch,
        }));
        setMarketListings(mapped);
      }
    }).catch(() => {});

    collaborationsApi.getPartners().then((serverPartners) => {
      if (serverPartners && serverPartners.length > 0) {
        setPartners(
          serverPartners.map((p: any) => ({
            id: p.id,
            name: p.name,
            industry: p.industry,
            tier: p.tier as any,
            location: p.location,
            emissionsReduced: p.emissions_reduced,
            description: p.description,
            website: p.website,
            connected: p.connected,
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const addCredits = (amount: number, reason?: string) => {
    setCredits((prev) => +(prev + amount).toFixed(2));
    toast({
      title: 'Carbon Credits Credited',
      description: `+${amount} CCT added to your wallet balance.${reason ? ` (${reason})` : ''}`,
    });
  };

  const deductCredits = (amount: number, reason?: string): boolean => {
    if (credits < amount) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${amount} CCT, but your current balance is ${credits} CCT.`,
        variant: 'destructive',
      });
      return false;
    }
    setCredits((prev) => +(prev - amount).toFixed(2));
    toast({
      title: 'Credits Deducted',
      description: `-${amount} CCT deducted from your wallet.${reason ? ` (${reason})` : ''}`,
    });
    return true;
  };

  const connectWallet = async (address?: string) => {
    if (address) {
      setWalletConnected(true);
      setWalletAddress(address);
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${address.substring(0, 8)}...`,
      });
      return;
    }

    const anyWindow = window as any;
    if (typeof window !== 'undefined' && anyWindow.ethereum) {
      try {
        const accounts = await anyWindow.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const userAddr = accounts[0];
          setWalletConnected(true);
          setWalletAddress(userAddr);
          toast({
            title: 'MetaMask Connected',
            description: `Live EVM account active: ${userAddr.substring(0, 6)}...${userAddr.substring(userAddr.length - 4)}`,
          });
          return;
        }
      } catch (err: any) {
        console.warn('MetaMask connection request rejected or failed:', err);
      }
    }

    // Graceful fallback to demo address if no extension or user dismissed
    const fallbackAddr = '0x71C83B927a488e02b8E' + Math.random().toString(36).substring(2, 6);
    setWalletConnected(true);
    setWalletAddress(fallbackAddr);
    toast({
      title: 'Wallet Connected (Demo Mode)',
      description: `Simulated wallet active: ${fallbackAddr.substring(0, 8)}... (MetaMask extension not detected)`,
    });
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    toast({
      title: 'Wallet Disconnected',
      description: 'Your Web3 wallet has been disconnected.',
    });
  };

  const addActivity = (activityData: Omit<Activity, 'id' | 'date'>) => {
    const newAct: Activity = {
      ...activityData,
      id: 'act-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    setActivities((prev) => [newAct, ...prev]);
    addCredits(newAct.creditsEarned, newAct.title);

    // Eco-Friendly Bonus matching Lovable specification
    const textToCheck = `${newAct.title} ${newAct.category}`.toLowerCase();
    if (
      textToCheck.includes('electric') ||
      textToCheck.includes('solar') ||
      textToCheck.includes('wind') ||
      textToCheck.includes('public transit') ||
      textToCheck.includes('rickshaw')
    ) {
      const bonus = +(newAct.creditsEarned * 0.5).toFixed(1);
      setTimeout(() => {
        addCredits(bonus, `Eco-Friendly ${newAct.category} Bonus`);
        toast({
          title: 'Eco-Friendly Bonus Earned!',
          description: `You earned +${bonus} bonus credits for choosing green sustainable options!`,
        });
      }, 500);
    }
  };

  const addMarketListing = async (listingData: Omit<MarketListing, 'id' | 'date' | 'seller'>) => {
    const token = getAuthToken();
    if (token) {
      try {
        const created = await marketplaceApi.createListing(
          listingData.amount,
          listingData.pricePerCredit,
          listingData.project,
          listingData.country
        );
        const me = await authApi.getMe();
        setCredits(me.credit_balance);
        const newListing: MarketListing = {
          id: created.id,
          seller: created.seller_address || created.seller_id,
          amount: created.amount,
          pricePerCredit: created.price_per_credit,
          pricePerCreditETH: created.price_per_credit_eth,
          project: created.project,
          country: created.country,
          type: 'sale',
          date: (created.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
        };
        setMarketListings((prev) => [newListing, ...prev]);
        toast({
          title: 'Marketplace Listing Created',
          description: `Listed ${created.amount} CCT at $${created.price_per_credit}/CCT. Deducted into escrow.`,
        });
        return;
      } catch (err: any) {
        toast({
          title: 'Listing Creation Failed',
          description: err.message || 'Could not create listing on server.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Local Sandbox Mode (unauthenticated)
    const newListing: MarketListing = {
      ...listingData,
      id: 'list-' + Date.now(),
      seller: walletConnected ? walletAddress : '0xCurrent...User',
      date: new Date().toISOString().split('T')[0],
    };
    setMarketListings((prev) => [newListing, ...prev]);
    toast({
      title: 'Marketplace Listing Created (Local Sandbox)',
      description: `Offered ${listingData.amount} CCT at $${listingData.pricePerCredit}/CCT (Offline sandbox mode).`,
    });
  };

  const buyCreditsFromListing = async (listingId: string): Promise<boolean> => {
    const target = marketListings.find((l) => l.id === listingId);
    if (!target) return false;

    const token = getAuthToken();
    if (token) {
      try {
        const txResult = await marketplaceApi.buyListing(listingId);
        const me = await authApi.getMe();
        setCredits(me.credit_balance);
        setMarketListings((prev) => prev.filter((l) => l.id !== listingId));

        const newTx: CreditTransaction = {
          id: txResult.id,
          txHash: txResult.tx_hash,
          type: 'Buy',
          amountCCT: txResult.amount_cct,
          pricePerCredit: txResult.price_per_credit,
          priceETH: txResult.price_eth,
          counterparty: txResult.counterparty,
          date: (txResult.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
          status: 'Confirmed',
        };
        setCreditTransactions((prev) => [newTx, ...prev]);

        toast({
          title: 'Carbon Credits Purchased',
          description: `Acquired ${txResult.amount_cct} CCT. Verified tx hash: ${txResult.tx_hash.substring(0, 12)}...`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: 'Purchase Failed',
          description: err.message || 'Failed to complete transaction on backend.',
          variant: 'destructive',
        });
        return false;
      }
    }

    // Unauthenticated Sandbox Demo Mode
    addCredits(target.amount, `Purchased from ${target.project}`);
    setMarketListings((prev) => prev.filter((l) => l.id !== listingId));

    const newTx: CreditTransaction = {
      id: 'tx-' + Date.now(),
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'Buy',
      amountCCT: target.amount,
      pricePerCredit: target.pricePerCredit,
      priceETH: +(target.amount * target.pricePerCreditETH).toFixed(4),
      counterparty: target.seller,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
    };
    setCreditTransactions((prev) => [newTx, ...prev]);

    toast({
      title: 'Carbon Credits Purchased (Local Sandbox)',
      description: `Acquired ${target.amount} CCT in local offline sandbox mode. Sign in to execute verified backend trades.`,
    });
    return true;
  };

  const cancelMarketListing = async (listingId: string): Promise<boolean> => {
    const target = marketListings.find((l) => l.id === listingId);
    if (!target) return false;

    const token = getAuthToken();
    if (token) {
      try {
        await marketplaceApi.cancelListing(listingId);
        const me = await authApi.getMe();
        setCredits(me.credit_balance);
        setMarketListings((prev) => prev.filter((l) => l.id !== listingId));

        toast({
          title: 'Listing Cancelled & Escrow Refunded',
          description: `Listing ${listingId} cancelled. ${target.amount} CCT refunded to your balance.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: 'Cancellation Failed',
          description: err.message || 'Could not cancel listing on server.',
          variant: 'destructive',
        });
        return false;
      }
    }

    // Local sandbox fallback
    addCredits(target.amount, `Refund for cancelled listing`);
    setMarketListings((prev) => prev.filter((l) => l.id !== listingId));
    toast({
      title: 'Listing Cancelled (Local Sandbox)',
      description: `Listing removed and ${target.amount} CCT refunded.`,
    });
    return true;
  };

  const buyProduct = async (
    productId: string,
    paymentMethod: 'ETH' | 'USD' | 'CCT',
    shippingAddress: string
  ): Promise<boolean> => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    if (product.stock <= 0) {
      toast({
        title: 'Product Out of Stock',
        description: 'Sorry, this eco item is temporarily sold out.',
        variant: 'destructive',
      });
      return false;
    }

    const token = getAuthToken();
    if (token) {
      try {
        const orderRes = await productsApi.placeOrder(productId, paymentMethod, shippingAddress);
        const me = await authApi.getMe();
        setCredits(me.credit_balance);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: p.stock - 1 } : p))
        );
        const newOrder: ProductOrder = {
          id: orderRes.id,
          productId: orderRes.product_id,
          productName: orderRes.product_name,
          buyer: me.email,
          pricePaid: orderRes.price_paid,
          paymentMethod: orderRes.payment_method as any,
          shippingAddress: orderRes.shipping_address,
          date: (orderRes.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
          status: 'Confirmed',
        };
        setProductOrders((prev) => [newOrder, ...prev]);

        toast({
          title: 'Order Confirmed',
          description: `Ordered ${orderRes.product_name} via ${orderRes.payment_method}. Persisted to database.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: 'Order Failed',
          description: err.message || 'Could not place order on server.',
          variant: 'destructive',
        });
        return false;
      }
    }

    // Unauthenticated Sandbox Demo Mode
    if (paymentMethod === 'CCT') {
      if (credits < product.priceCCT) {
        toast({
          title: 'Insufficient Carbon Credits',
          description: `You need ${product.priceCCT} CCT, but have ${credits} CCT available.`,
          variant: 'destructive',
        });
        return false;
      }
      deductCredits(product.priceCCT, `Purchased ${product.name}`);
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock - 1 } : p))
    );

    const newOrder: ProductOrder = {
      id: 'ord-' + Date.now(),
      productId: product.id,
      productName: product.name,
      buyer: walletConnected ? walletAddress : 'Demo User',
      pricePaid: paymentMethod === 'CCT' ? `${product.priceCCT} CCT` : paymentMethod === 'ETH' ? `${product.priceETH} ETH` : `$${product.priceUSD} USD`,
      paymentMethod,
      shippingAddress: shippingAddress.trim() || 'Standard Delivery Address',
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
    };
    setProductOrders((prev) => [newOrder, ...prev]);

    toast({
      title: 'Order Confirmed (Sandbox Demo)',
      description: `Ordered ${product.name} via ${paymentMethod}. Saved to local session.`,
    });
    return true;
  };

  const redeemReward = async (rewardId: string): Promise<boolean> => {
    const reward = rewards.find((r) => r.id === rewardId) || initialRewards.find((r) => r.id === rewardId);
    if (!reward) return false;

    const token = getAuthToken();
    if (token) {
      try {
        const res = await rewardsApi.redeemReward(rewardId);
        const me = await authApi.getMe();
        setCredits(me.credit_balance);
        const redemption: RewardRedemption = {
          id: res.id,
          rewardId: res.reward_id,
          title: res.title || res.reward_title || reward.title,
          costCCT: res.cost_cct,
          voucherCode: res.voucher_code,
          date: (res.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
        };
        setRewardRedemptions((prev) => [redemption, ...prev]);

        toast({
          title: 'Reward Redeemed',
          description: `Voucher code ${res.voucher_code} confirmed and recorded in database.`,
        });
        return true;
      } catch (err: any) {
        toast({
          title: 'Redemption Failed',
          description: err.message || 'Server rejected reward redemption.',
          variant: 'destructive',
        });
        return false;
      }
    }

    // Unauthenticated Sandbox Demo Mode
    if (deductCredits(reward.cost, `Redeemed ${reward.title}`)) {
      const redemption: RewardRedemption = {
        id: 'red-' + Date.now(),
        rewardId: reward.id,
        title: reward.title,
        costCCT: reward.cost,
        voucherCode: `ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: new Date().toISOString().split('T')[0],
      };
      setRewardRedemptions((prev) => [redemption, ...prev]);

      toast({
        title: 'Reward Redeemed (Demo Code)',
        description: `Voucher code ${redemption.voucherCode} created in local sandbox.`,
      });
      return true;
    }
    return false;
  };

  const togglePartnerConnection = (partnerId: string) => {
    collaborationsApi.togglePartner(partnerId).catch(() => {});

    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId) {
          const nextState = !p.connected;
          toast({
            title: nextState ? 'Collaboration Established' : 'Collaboration Paused',
            description: `${p.name} partnership status updated.`,
          });
          return { ...p, connected: nextState };
        }
        return p;
      })
    );
  };

  const proposeCollaboration = async (partnerId: string, scope: string, message: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) return;

    const token = getAuthToken();
    if (token) {
      try {
        const propRes = await collaborationsApi.submitProposal(partnerId, scope, message);
        const newProposal: CollaborationProposal = {
          id: propRes.id,
          partnerId: propRes.partner_id,
          partnerName: propRes.partner_name,
          scope: propRes.scope,
          proposedBy: propRes.proposed_by_org,
          message: propRes.message,
          date: (propRes.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
          status: 'Under Review',
        };

        setCollaborationProposals((prev) => [newProposal, ...prev]);

        toast({
          title: 'Partnership Proposal Submitted',
          description: `Scope: "${scope}" submitted to ${partner.name}. Stored in database.`,
        });
        return;
      } catch (err: any) {
        toast({
          title: 'Proposal Submission Failed',
          description: err.message || 'Server rejected proposal.',
          variant: 'destructive',
        });
        return;
      }
    }

    const newProposal: CollaborationProposal = {
      id: 'prop-' + Date.now(),
      partnerId,
      partnerName: partner.name,
      scope,
      proposedBy: walletConnected ? walletAddress : 'Corporate Sustainability Office',
      message: message.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'Under Review',
    };

    setCollaborationProposals((prev) => [newProposal, ...prev]);

    toast({
      title: 'Partnership Proposal Submitted (Sandbox)',
      description: `Scope: "${scope}" submitted to ${partner.name} (Offline sandbox mode).`,
    });
  };

  return (
    <CarbonFootprintContext.Provider
      value={{
        credits,
        walletConnected,
        walletAddress,
        activities,
        marketListings,
        creditTransactions,
        products,
        productOrders,
        rewards,
        rewardRedemptions,
        partners,
        collaborationProposals,
        addCredits,
        deductCredits,
        connectWallet,
        disconnectWallet,
        addActivity,
        addMarketListing,
        buyCreditsFromListing,
        cancelMarketListing,
        buyProduct,
        redeemReward,
        togglePartnerConnection,
        proposeCollaboration,
      }}
    >
      {children}
    </CarbonFootprintContext.Provider>
  );
};

export const useCarbonFootprint = () => {
  const context = useContext(CarbonFootprintContext);
  if (!context) {
    throw new Error('useCarbonFootprint must be used within a CarbonFootprintProvider');
  }
  return context;
};
