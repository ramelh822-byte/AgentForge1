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
export type AssetType = 'website' | 'newsletter' | 'saas' | 'affiliate' | 'content' | 'marketplace';

export type BusinessAsset = {
  id: string;
  name: string;
  niche: string;
  assetType: AssetType;
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

export type DecisionType = 'growth' | 'kill' | 'experiment' | 'allocate';

export type Decision = {
  id: string;
  title: string;
  type: DecisionType;
  urgency: 'high' | 'medium' | 'low';
  asset?: string;
  reason: string;
  expectedImpact?: string;
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

  const decisions: Decision[] = [
    {
      id: 'decision-01',
      title: 'Scale Music CreatorOS',
      type: 'growth',
      urgency: 'high',
      asset: 'Music CreatorOS',
      reason: 'High demand, strong monetization, and strong automation leverage.',
      expectedImpact: '+$2.9k MRR / month',
    },
    {
      id: 'decision-02',
      title: 'Archive Site #19',
      type: 'kill',
      urgency: 'high',
      asset: 'Site #19',
      reason: 'Revenue under threshold and declining conversion rate for 180+ days.',
      expectedImpact: 'Free 6+ hrs/week for better tests',
    },
    {
      id: 'decision-03',
      title: 'Expand creator lead-gen experiments',
      type: 'experiment',
      urgency: 'medium',
      asset: 'Creator Revenue Agent',
      reason: 'Creator growth assets show stable traffic and high conversion potential.',
      expectedImpact: '+14% test-to-launch efficiency',
    },
    {
      id: 'decision-04',
      title: 'Allocate capital to AI music licensing',
      type: 'allocate',
      urgency: 'medium',
      asset: 'AI Music Licensing',
      reason: 'This opportunity has the strongest score and the most defensible growth profile.',
      expectedImpact: '7-9 month compounding upside',
    },
  ];

  const capitalPlan = [
    {
      id: 'cap-01',
      target: 'Music CreatorOS',
      allocation: 4200,
      priority: 'Primary',
      reason: 'Strongest combined revenue and automation profile.',
      expectedRoi: '3.1x projected 12-month ROI',
    },
    {
      id: 'cap-02',
      target: 'Creator Growth OS',
      allocation: 2600,
      priority: 'Secondary',
      reason: 'High opportunity score with good monetization runway.',
      expectedRoi: '2.8x projected 12-month ROI',
    },
    {
      id: 'cap-03',
      target: 'AI Podcast Workflow',
      allocation: 1500,
      priority: 'Test',
      reason: 'Promising but still needs sharper validation before expansion.',
      expectedRoi: '1.8x projected 12-month ROI',
    },
  ];

  const lifecycleSummary = {
    active: mockAssets.filter((asset) => asset.status === 'active').length,
    testing: mockAssets.filter((asset) => asset.status === 'testing').length,
    scaling: mockAssets.filter((asset) => asset.status === 'scaling').length,
    paused: mockAssets.filter((asset) => asset.status === 'paused').length,
  };

  return {
    summary: {
      totalRevenue,
      totalTraffic,
      activeAssets,
      opportunities: opportunities.length,
      highPriority,
    },
    opportunities,
    assets: mockAssets,
    decisions,
    capitalPlan,
    lifecycleSummary,
  };
}

export function buildRecommendations() {
  return buildPortfolioSummary().opportunities
    .map((opportunity) => ({
      ...opportunity,
      recommendation: opportunity.score.recommendation,
      confidence: Math.max(50, Math.min(97, opportunity.score.total)),
    }))
    .sort((a, b) => b.score.total - a.score.total);
}

export function getLifecycleGovernance() {
  const assets = mockAssets.map((asset) => ({
    ...asset,
    governance: asset.status === 'paused' ? 'kill-review' : asset.status === 'scaling' ? 'scale' : 'monitor',
  }));

  return {
    assets,
    rules: [
      'If asset age > 180 days and revenue < $100/month, archive it.',
      'If opportunity score > 80 and monetization > 0.8, prioritize scale.',
      'If conversion rate drops below 1% for 30 days, enter pause review.',
    ],
  };
}
