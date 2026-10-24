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

  const totalRevenue = opportunities.reduce((sum, item) => sum + item.revenue, 0);
  const totalTraffic = opportunities.reduce((sum, item) => sum + item.traffic, 0);
  const activeAssets = opportunities.length + 4;

  return {
    summary: {
      totalRevenue,
      totalTraffic,
      activeAssets,
      opportunities: opportunities.length,
      highPriority: opportunities.filter((item) => item.score.total >= 80).length,
    },
    opportunities,
  };
}
