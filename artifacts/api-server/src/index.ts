import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { config } from './config.js';
import { checkoutRequestSchema } from '@workspace/api-zod';
import { buildPortfolioSummary, buildRecommendations } from './opportunity-engine.js';

const app = express();
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2024-06-20',
});

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29/mo',
    description: 'For new operators who need AI workflow automation and Stripe billing.',
    stripePriceId: 'price_123',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$99/mo',
    description: 'For teams scaling ops with deeper automation and orchestration.',
    stripePriceId: 'price_456',
  },
];

app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'agentforge-api', timestamp: new Date().toISOString() });
});

app.get('/api/plans', (_req, res) => {
  res.json(plans);
});

app.get('/api/portfolio', (_req, res) => {
  res.json(buildPortfolioSummary());
});

app.get('/api/opportunities', (_req, res) => {
  res.json(buildPortfolioSummary().opportunities);
});

app.get('/api/assets', (_req, res) => {
  res.json(buildPortfolioSummary().assets);
});

app.get('/api/recommendations', (_req, res) => {
  res.json(buildRecommendations());
});

app.get('/api/decisions', (_req, res) => {
  res.json(buildPortfolioSummary().decisions);
});

app.post('/api/checkout', express.json(), async (req, res) => {
  const parsed = checkoutRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid checkout payload', details: parsed.error.flatten() });
  }

  const { planId, customerEmail } = parsed.data;
  const selectedPlan = plans.find((plan) => plan.id === planId);

  if (!selectedPlan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  if (!config.stripeSecretKey || config.stripeSecretKey.startsWith('sk_test_your_key_here')) {
    return res.status(400).json({
      error: 'Stripe is not configured. Add your real STRIPE_SECRET_KEY before creating checkout sessions.',
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: customerEmail,
      line_items: [{ price: selectedPlan.stripePriceId, quantity: 1 }],
      success_url: `${config.clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.clientUrl}/cancelled`,
      metadata: {
        planId: selectedPlan.id,
        source: 'agentforge',
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create Stripe session';
    res.status(500).json({ error: message });
  }
});

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, signature, config.stripeWebhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed', session.id, session.metadata?.planId ?? 'unknown-plan');
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('Invoice paid', invoice.id, invoice.amount_paid);
        break;
      }
      default:
        console.log('Unhandled Stripe event', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload';
    res.status(400).json({ error: message });
  }
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  res.status(500).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`AgentForge API running on http://localhost:${config.port}`);
});
