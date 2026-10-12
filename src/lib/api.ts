// Full-Stack API Client for Carbon Footprint Fuse

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('ecofuse_jwt_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('ecofuse_jwt_token', token);
  } else {
    localStorage.removeItem('ecofuse_jwt_token');
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// --- Auth Endpoints ---
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.access_token);
    return data;
  },
  register: async (name: string, email: string, password: string, organization?: string) => {
    const data = await apiRequest<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, organization }),
    });
    setAuthToken(data.access_token);
    return data;
  },
  getMe: async () => {
    return apiRequest<any>('/auth/me');
  },
  updateMe: async (updateData: any) => {
    return apiRequest<any>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },
};

// --- Calculator Endpoints ---
export const calculatorApi = {
  calculateAudit: async (countryCode: string, sectorId: string, subSectorId: string, inputs: Record<string, number>) => {
    return apiRequest<any>('/calculator/calculate', {
      method: 'POST',
      body: JSON.stringify({
        country_code: countryCode,
        sector_id: sectorId,
        sub_sector_id: subSectorId,
        inputs,
      }),
    });
  },
  getActivities: async () => {
    return apiRequest<any[]>('/calculator/activities');
  },
  logActivity: async (title: string, category: string, reductionKg: number, creditsEarned: number) => {
    return apiRequest<any>('/calculator/activities', {
      method: 'POST',
      body: JSON.stringify({
        title,
        category,
        reduction_kg: reductionKg,
        credits_earned: creditsEarned,
      }),
    });
  },
};

// --- Marketplace Endpoints ---
export const marketplaceApi = {
  getListings: async () => {
    return apiRequest<any[]>('/marketplace/listings');
  },
  createListing: async (amount: number, pricePerCredit: number, project: string, country: string) => {
    return apiRequest<any>('/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        price_per_credit: pricePerCredit,
        project,
        country,
      }),
    });
  },
  buyListing: async (listingId: string) => {
    return apiRequest<any>(`/marketplace/listings/${listingId}/buy`, {
      method: 'POST',
    });
  },
  cancelListing: async (listingId: string) => {
    return apiRequest<any>(`/marketplace/listings/${listingId}/cancel`, {
      method: 'POST',
    });
  },
  getTransactions: async () => {
    return apiRequest<any[]>('/marketplace/transactions');
  },
};

// --- Sustainable Products Endpoints ---
export const productsApi = {
  getProducts: async () => {
    return apiRequest<any[]>('/products');
  },
  getProductDetails: async (productId: string) => {
    return apiRequest<any>(`/products/${productId}`);
  },
  placeOrder: async (productId: string, paymentMethod: string, shippingAddress: string) => {
    return apiRequest<any>('/products/orders', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
      }),
    });
  },
  getOrders: async () => {
    return apiRequest<any[]>('/products/orders/me');
  },
};

// --- Rewards Endpoints ---
export const rewardsApi = {
  getRewards: async () => {
    return apiRequest<any[]>('/rewards');
  },
  redeemReward: async (rewardId: string) => {
    return apiRequest<any>('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ reward_id: rewardId }),
    });
  },
  getRedemptions: async () => {
    return apiRequest<any[]>('/rewards/redemptions/me');
  },
};

// --- Collaborations Endpoints ---
export const collaborationsApi = {
  getPartners: async () => {
    return apiRequest<any[]>('/collaborations/partners');
  },
  togglePartner: async (partnerId: string) => {
    return apiRequest<any>(`/collaborations/partners/${partnerId}/toggle`, {
      method: 'POST',
    });
  },
  submitProposal: async (partnerId: string, scope: string, message: string) => {
    return apiRequest<any>('/collaborations/proposals', {
      method: 'POST',
      body: JSON.stringify({
        partner_id: partnerId,
        scope,
        message,
      }),
    });
  },
  getProposals: async () => {
    return apiRequest<any[]>('/collaborations/proposals/me');
  },
};

// --- Carbon Intelligence & Analytics Endpoints ---
export const analyticsApi = {
  getOverview: async (period: string = '30d', category?: string) => {
    let url = `/analytics/overview?period=${encodeURIComponent(period)}`;
    if (category && category !== 'all') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return apiRequest<any>(url);
  },
  getBenchmarks: async () => {
    return apiRequest<any[]>('/analytics/benchmarks');
  },
  getRecommendations: async (category?: string) => {
    let url = '/analytics/recommendations';
    if (category && category !== 'all') {
      url += `?category=${encodeURIComponent(category)}`;
    }
    return apiRequest<any[]>(url);
  },
  updateRecommendationStatus: async (recId: string, status: string) => {
    return apiRequest<any>(`/analytics/recommendations/${recId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  getTargets: async () => {
    return apiRequest<any[]>('/analytics/targets');
  },
  createTarget: async (targetData: {
    target_name: string;
    target_type: string;
    target_value: number;
    baseline_annual_kg: number;
    target_annual_kg: number;
    target_year: number;
  }) => {
    return apiRequest<any>('/analytics/targets', {
      method: 'POST',
      body: JSON.stringify(targetData),
    });
  },
  getCorporateFacilities: async () => {
    return apiRequest<any[]>('/analytics/corporate/facilities');
  },
  createCorporateFacility: async (facilityData: {
    organization_name: string;
    facility_name: string;
    department?: string;
    country?: string;
  }) => {
    return apiRequest<any>('/analytics/corporate/facilities', {
      method: 'POST',
      body: JSON.stringify(facilityData),
    });
  },
  getCorporateRecords: async (facilityId?: string) => {
    let url = '/analytics/corporate/records';
    if (facilityId) {
      url += `?facility_id=${encodeURIComponent(facilityId)}`;
    }
    return apiRequest<any[]>(url);
  },
  createCorporateRecord: async (recordData: {
    facility_id: string;
    scope: string;
    reporting_period: string;
    category: string;
    activity_metric: number;
    metric_unit: string;
    emission_factor_source?: string;
  }) => {
    return apiRequest<any>('/analytics/corporate/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },
};

// --- Traceable Carbon Credits & Provenance Endpoints ---
export const provenanceApi = {
  getBatches: async (filter?: { status?: string; my_only?: boolean }) => {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.my_only) params.append('my_only', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<any[]>(`/provenance/batches${query}`);
  },
  getBatchDetails: async (batchId: string) => {
    return apiRequest<any>(`/provenance/batches/${batchId}`);
  },
  createBatch: async (batchData: {
    project_name: string;
    project_type: string;
    project_location: string;
    methodology: string;
    registry_name: string;
    registry_id?: string;
    vintage_year: number;
    initial_quantity: number;
    unit?: string;
    verification_org?: string;
    evidence_doc_name?: string;
    evidence_doc_url?: string;
    evidence_hash?: string;
  }) => {
    return apiRequest<any>('/provenance/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  },
  attachEvidence: async (batchId: string, evidence: {
    evidence_doc_name: string;
    evidence_doc_url: string;
    evidence_hash: string;
  }) => {
    return apiRequest<any>(`/provenance/batches/${batchId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(evidence),
    });
  },
  submitBatch: async (batchId: string) => {
    return apiRequest<any>(`/provenance/batches/${batchId}/submit`, {
      method: 'POST',
    });
  },
  reviewBatch: async (batchId: string, review: {
    action: 'verify' | 'reject';
    rejection_reason?: string;
    notes?: string;
  }) => {
    return apiRequest<any>(`/provenance/batches/${batchId}/review`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },
  retireCredits: async (batchId: string, retireData: {
    amount: number;
    beneficiary: string;
    retirement_reason: string;
  }) => {
    return apiRequest<any>(`/provenance/batches/${batchId}/retire`, {
      method: 'POST',
      body: JSON.stringify(retireData),
    });
  },
  getRetirements: async () => {
    return apiRequest<any[]>('/provenance/retirements');
  },
  getCertificate: async (certCode: string) => {
    return apiRequest<any>(`/provenance/retirements/certificate/${certCode}`);
  },
};

