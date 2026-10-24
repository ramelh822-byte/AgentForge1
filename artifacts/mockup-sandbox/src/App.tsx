import { useState } from 'react';

const plans = [
  { id: 'starter', name: 'Starter', price: '$29/mo', description: 'AI ops for a single team.' },
  { id: 'growth', name: 'Growth', price: '$99/mo', description: 'Scale automations across multiple workflows.' },
];

export default function App() {
  const [email, setEmail] = useState('ops@example.com');
  const [status, setStatus] = useState('Ready to launch');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (planId: string) => {
    setLoading(true);
    setStatus('Creating Stripe checkout session...');

    try {
      const apiBase = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        <h1>Autonomous billing and workflow ops connected to Stripe</h1>
        <p className="subtext">
          Launch a Stripe-backed customer journey and manage autonomous operations from a single dashboard.
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

      <p className="status">Status: {status}</p>
    </main>
  );
}
