export type OpportunityInput = {
  demand: number;
  competition: number;
  monetization: number;
  automation: number;
  risk: number;
};

export type OpportunityResult = {
  total: number;
  recommendation: 'launch' | 'test' | 'watch' | 'avoid';
  reasons: OpportunityInput;
};

export type AssetStatus = 'active' | 'testing' | 'scaling' | 'paused' | 'archived';

export type BusinessAsset = {
  id: string;
  name: string;
  niche: string;
  assetType: 'website' | 'newsletter' | 'saas' | 'affiliate' | 'content' | 'marketplace';
  traction: {
    traffic: number;
    revenue: number;
    conversionRate: number;
  };
  scores: {
    demand: number;
    competition: number;
    monetization: number;
    automation: number;
    risk: number;
  };
  status: AssetStatus;
  nextAction: 'scale' | 'pause' | 'kill' | 'expand' | 'iterate';
};

export const scoreOpportunity = ({
  demand,
  competition,
  monetization,
  automation,
  risk,
}: OpportunityInput): OpportunityResult => {
  const weightedScore =
    demand * 30 +
    (1 - competition) * 20 +
    automation * 20 +
    monetization * 20 +
    (1 - risk) * 10;

  const total = Math.round(weightedScore * 100);

  let recommendation: OpportunityResult['recommendation'] = 'avoid';
  if (total >= 80) recommendation = 'launch';
  else if (total >= 65) recommendation = 'test';
  else if (total >= 50) recommendation = 'watch';

  return {
    total,
    recommendation,
    reasons: { demand, competition, monetization, automation, risk },
  };
};

export const mockOpportunities = [
  {
    id: 'opp-001',
    name: 'AI Music Licensing',
    niche: 'music',
    demand: 0.88,
    competition: 0.41,
    monetization: 0.91,
    automation: 0.94,
    risk: 0.32,
    revenue: 4790,
    traffic: 18400,
  },
  {
    id: 'opp-002',
    name: 'Creator Growth OS',
    niche: 'creator',
    demand: 0.81,
    competition: 0.46,
    monetization: 0.86,
    automation: 0.9,
    risk: 0.38,
    revenue: 3120,
    traffic: 12950,
  },
  {
    id: 'opp-003',
    name: 'AI Podcast Workflow',
    niche: 'media',
    demand: 0.74,
    competition: 0.57,
    monetization: 0.72,
    automation: 0.88,
    risk: 0.44,
    revenue: 2150,
    traffic: 8900,
  },
  {
    id: 'opp-004',
    name: 'Newsletter Authority Engine',
    niche: 'newsletter',
    demand: 0.66,
    competition: 0.63,
    monetization: 0.68,
    automation: 0.8,
    risk: 0.48,
    revenue: 1820,
    traffic: 6200,
  },
];

export const mockAssets: BusinessAsset[] = [
  {
    id: 'asset-01',
    name: 'Music CreatorOS',
    niche: 'music',
    assetType: 'saas',
    traction: { traffic: 18400, revenue: 4900, conversionRate: 8.2 },
    scores: { demand: 0.9, competition: 0.4, monetization: 0.92, automation: 0.95, risk: 0.2 },
    status: 'scaling',
    nextAction: 'scale',
  },
  {
    id: 'asset-02',
    name: 'Creator Revenue Agent',
    niche: 'creator',
    assetType: 'saas',
    traction: { traffic: 14200, revenue: 14400, conversionRate: 7.4 },
    scores: { demand: 0.87, competition: 0.42, monetization: 0.95, automation: 0.92, risk: 0.24 },
    status: 'active',
    nextAction: 'expand',
  },
  {
    id: 'asset-03',
    name: 'Affiliate Asset Network',
    niche: 'affiliate',
    assetType: 'website',
    traction: { traffic: 9800, revenue: 7500, conversionRate: 4.1 },
    scores: { demand: 0.7, competition: 0.52, monetization: 0.82, automation: 0.86, risk: 0.35 },
    status: 'active',
    nextAction: 'scale',
  },
  {
    id: 'asset-04',
    name: 'Newsletter Network',
    niche: 'newsletter',
    assetType: 'newsletter',
    traction: { traffic: 5200, revenue: 2200, conversionRate: 3.5 },
    scores: { demand: 0.68, competition: 0.5, monetization: 0.74, automation: 0.81, risk: 0.4 },
    status: 'testing',
    nextAction: 'iterate',
  },
  {
    id: 'asset-05',
    name: 'Site #19',
    niche: 'creator',
    assetType: 'website',
    traction: { traffic: 2300, revenue: 74, conversionRate: 0.9 },
    scores: { demand: 0.4, competition: 0.7, monetization: 0.33, automation: 0.85, risk: 0.64 },
    status: 'paused',
    nextAction: 'kill',
  },
];

export function buildPortfolioSummary() {
  const opportunities = mockOpportunities.map((opportunity) => ({
    ...opportunity,
    score: scoreOpportunity({
      demand: opportunity.demand,
      competition: opportunity.competition,
      monetization: opportunity.monetization,
      automation: opportunity.automation,
      risk: opportunity.risk,
    }),
  }));

  const totalRevenue = mockAssets.reduce((sum, asset) => sum + asset.traction.revenue, 0);
  const totalTraffic = mockAssets.reduce((sum, asset) => sum + asset.traction.traffic, 0);
  const activeAssets = mockAssets.filter((asset) => asset.status !== 'archived').length;
  const highPriority = opportunities.filter((item) => item.score.total >= 80).length;

  const assetHealth = {
    totalRevenue,
    totalTraffic,
    activeAssets,
    opportunities: opportunities.length,
    highPriority,
  };

  const decisions = [
    {
      id: 'decision-01',
      title: 'Scale Music CreatorOS',
      type: 'growth',
      urgency: 'high',
      reason: 'High demand, strong monetization, and strong automation leverage.',
    },
    {
      id: 'decision-02',
      title: 'Archive Site #19',
      type: 'kill',
      urgency: 'high',
      reason: 'Revenue under threshold and declining conversion rate for 180+ days.',
    },
    {
      id: 'decision-03',
      title: 'Expand creator lead-gen experiments',
      type: 'experiment',
      urgency: 'medium',
      reason: 'Creator growth assets show stable traffic and high conversion potential.',
    },
  ];

  return {
    summary: assetHealth,
    opportunities,
    assets: mockAssets,
    decisions,
  };
}

export function buildRecommendations() {
  const portfolio = buildPortfolioSummary();

  return portfolio.opportunities
    .map((opportunity) => ({
      ...opportunity,
      recommendation: opportunity.score.recommendation,
      confidence: Math.max(50, Math.min(97, opportunity.score.total)),
    }))
    .sort((a, b) => b.score.total - a.score.total);
}
