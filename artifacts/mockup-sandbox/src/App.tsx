import { useEffect, useState } from 'react';

type Decision = {
  id: string;
  title: string;
  type: string;
  urgency: string;
  reason: string;
};

type Asset = {
  id: string;
  name: string;
  niche: string;
  assetType: string;
  traction: {
    traffic: number;
    revenue: number;
    conversionRate: number;
  };
  status: string;
  nextAction: string;
};

type PortfolioState = {
  summary: {
    totalRevenue: number;
    totalTraffic: number;
    activeAssets: number;
    opportunities: number;
    highPriority: number;
  };
  opportunities: Array<{
    id: string;
    name: string;
    niche: string;
    revenue: number;
    traffic: number;
    score: {
      total: number;
      recommendation: string;
    };
  }>;
  assets: Asset[];
  decisions: Decision[];
};

const plans = [
  { id: 'starter', name: 'Starter', price: '$29/mo', description: 'AI ops for a single team.' },
  { id: 'growth', name: 'Growth', price: '$99/mo', description: 'Scale automations across multiple workflows.' },
];

export default function App() {
  const [email, setEmail] = useState('ops@example.com');
  const [status, setStatus] = useState('Ready to launch');
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000';
    fetch(`${apiBase}/api/portfolio`)
      .then((res) => res.json())
      .then((data) => setPortfolio(data))
      .catch(() => setStatus('Unable to fetch portfolio snapshot'));
  }, []);

  const handleCheckout = async (planId: string) => {
    setLoading(true);
    setStatus('Creating Stripe checkout session...');

    try {
      const apiBase = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, customerEmail: email }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? 'Checkout failed');
      }

      if (body.url) {
        window.location.href = body.url;
      } else {
        setStatus('Payment session created.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AgentForge1</p>
        <h1>Autonomous business factory for digitally scaled revenue</h1>
        <p className="subtext">
          Discover opportunities, build assets, generate traffic, monetize results, and scale winners while retiring weak businesses.
        </p>

        <div className="card">
          <label htmlFor="email">Customer email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@company.com"
          />
        </div>
      </section>

      <section className="metrics">
        <div className="metric">
          <span>Total Revenue</span>
          <strong>${portfolio?.summary.totalRevenue.toLocaleString() ?? '0'}</strong>
        </div>
        <div className="metric">
          <span>Active Assets</span>
          <strong>{portfolio?.summary.activeAssets ?? 0}</strong>
        </div>
        <div className="metric">
          <span>Tracked Traffic</span>
          <strong>{portfolio?.summary.totalTraffic.toLocaleString() ?? '0'}</strong>
        </div>
        <div className="metric">
          <span>High Priority</span>
          <strong>{portfolio?.summary.highPriority ?? 0}</strong>
        </div>
      </section>

      <section className="plans">
        {plans.map((plan) => (
          <article key={plan.id} className="plan">
            <h2>{plan.name}</h2>
            <p className="price">{plan.price}</p>
            <p>{plan.description}</p>
            <button type="button" onClick={() => handleCheckout(plan.id)} disabled={loading}>
              {loading ? 'Processing...' : `Launch ${plan.name}`}
            </button>
          </article>
        ))}
      </section>

      <section className="opportunities">
        <div className="section-title-row">
          <h2>Opportunity pipeline</h2>
          <span>{portfolio?.opportunities.length ?? 0} active</span>
        </div>

        <div className="opportunity-grid">
          {(portfolio?.opportunities ?? []).map((opportunity) => (
            <article key={opportunity.id} className="opportunity-card">
              <div className="opportunity-head">
                <div>
                  <p className="small-label">{opportunity.niche}</p>
                  <h3>{opportunity.name}</h3>
                </div>
                <span className={`tag ${opportunity.score.recommendation}`}>
                  {opportunity.score.recommendation}
                </span>
              </div>

              <div className="mini-stats">
                <div>
                  <span>Revenue</span>
                  <strong>${opportunity.revenue.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Traffic</span>
                  <strong>{opportunity.traffic.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Score</span>
                  <strong>{opportunity.score.total}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="asset-board">
        <div className="section-title-row">
          <h2>Asset board</h2>
          <span>Portfolio health</span>
        </div>

        <div className="asset-grid">
          {(portfolio?.assets ?? []).map((asset) => (
            <article key={asset.id} className="asset-card">
              <div className="asset-head">
                <div>
                  <p className="small-label">{asset.assetType}</p>
                  <h3>{asset.name}</h3>
                </div>
                <span className={`asset-status ${asset.status}`}>{asset.status}</span>
              </div>

              <div className="asset-meta">
                <div>
                  <span>Niche</span>
                  <strong>{asset.niche}</strong>
                </div>
                <div>
                  <span>Revenue</span>
                  <strong>${asset.traction.revenue.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Traffic</span>
                  <strong>{asset.traction.traffic.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Conversion</span>
                  <strong>{asset.traction.conversionRate}%</strong>
                </div>
              </div>

              <div className="asset-action-row">
                <span>Next action</span>
                <strong>{asset.nextAction}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="decision-board">
        <div className="section-title-row">
          <h2>Capital decisions</h2>
          <span>Action queue</span>
        </div>

        <div className="decision-list">
          {(portfolio?.decisions ?? []).map((decision) => (
            <div key={decision.id} className="decision-item">
              <div className={`decision-pill ${decision.type}`}>{decision.type}</div>
              <div>
                <h3>{decision.title}</h3>
                <p>{decision.reason}</p>
              </div>
              <span className={`urgency ${decision.urgency}`}>{decision.urgency}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="status">Status: {status}</p>
    </main>
  );
}
