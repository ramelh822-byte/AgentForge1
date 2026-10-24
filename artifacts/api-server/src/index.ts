import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, customers, payments, plans, workflowRuns } from '@workspace/db';
import { config } from './config.js';
import { checkoutRequestSchema } from '@workspace/api-zod';
import { buildPortfolioSummary, buildRecommendations, getLifecycleGovernance } from './opportunity-engine.js';

type PaddleCheckoutResponse = {
  data?: {
    checkout?: {
      url?: string;
    };
    url?: string;
  };
};

type PaddleWebhookEvent = {
  type: string;
  data?: {
    id?: string;
    status?: string;
    customer?: {
      email?: string;
    };
    custom_data?: Record<string, unknown>;
  };
};

const app = express();

const plansCatalog = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29/mo',
    description: 'For new operators who need AI workflow automation and hosted checkout billing.',
    providerPlanId: 'starter-plan',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$99/mo',
    description: 'For teams scaling ops with deeper automation and orchestration.',
    providerPlanId: 'growth-plan',
  },
] as const;

async function ensurePlanCatalog() {
  for (const plan of plansCatalog) {
    await db
      .insert(plans)
      .values({
        slug: plan.id,
        name: plan.name,
        priceLabel: plan.price,
        stripePriceId: plan.providerPlanId,
      })
      .onConflictDoNothing()
      .execute();
  }
}

async function upsertCustomerFromEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, normalized),
  });

  if (existing) {
    return existing;
  }

  const inserted = await db
    .insert(customers)
    .values({
      email: normalized,
      stripeCustomerId: null,
    })
    .returning();

  return inserted[0];
}

async function findPlanBySlug(slug: string) {
  return db.query.plans.findFirst({
    where: eq(plans.slug, slug),
  });
}

async function createPaddleCheckout({
  planId,
  customerEmail,
  productName,
}: {
  planId: string;
  customerEmail?: string;
  productName: string;
}) {
  const apiBase = config.paddleEnv === 'sandbox' ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
  const planConfig = plansCatalog.find((plan) => plan.id === planId);

  if (!planConfig) {
    throw new Error('Unsupported plan');
  }

  const response = await fetch(`${apiBase}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.paddleApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          price: {
            id: planConfig.providerPlanId,
          },
          quantity: 1,
        },
      ],
      customer: customerEmail
        ? {
            email: customerEmail,
          }
        : undefined,
      custom_data: {
        planId,
        source: 'agentforge',
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Paddle checkout creation failed: ${text}`);
  }

  const body = (await response.json()) as PaddleCheckoutResponse;
  const checkoutUrl = body.data?.checkout?.url ?? body.data?.url;

  if (!checkoutUrl) {
    throw new Error('Paddle did not return a checkout URL');
  }

  return checkoutUrl;
}

function verifyPaddleWebhook(rawBody: Buffer | string, signature: string, secret: string): PaddleWebhookEvent {
  const raw = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const received = signature.replace(/^sha256=/, '');
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');

  const receivedBuffer = Buffer.from(received, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (receivedBuffer.length !== expectedBuffer.length) {
    throw new Error('Invalid Paddle webhook signature length');
  }

  if (!crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
    throw new Error('Invalid Paddle webhook signature');
  }

  return JSON.parse(raw) as PaddleWebhookEvent;
}

async function handleSuccessfulPaddlePayment(event: PaddleWebhookEvent) {
  const planId = String(event.data?.custom_data?.planId ?? 'starter');
  const email = String(event.data?.customer?.email ?? '').trim().toLowerCase();

  if (!email) {
    throw new Error('Customer email missing from Paddle webhook payload');
  }

  const customer = await upsertCustomerFromEmail(email);
  const plan = await findPlanBySlug(planId);

  if (!plan) {
    throw new Error(`Plan not found for slug: ${planId}`);
  }

  await db
    .insert(payments)
    .values({
      customerId: customer.id,
      planId: plan.id,
      stripeSessionId: `paddle:${event.data?.id ?? 'unknown'}`,
      stripeInvoiceId: null,
      status: 'paid',
      metadata: {
        provider: 'paddle',
        eventType: event.type,
        customerEmail: email,
        planId,
        externalTransactionId: event.data?.id ?? null,
      },
      paidAt: new Date(),
      createdAt: new Date(),
    })
    .execute();

  await db
    .insert(workflowRuns)
    .values({
      name: 'paddle-payment-processed',
      status: 'succeeded',
      payload: {
        provider: 'paddle',
        eventType: event.type,
        customerEmail: email,
        planId,
        transactionId: event.data?.id ?? null,
      },
      result: {
        success: true,
        message: 'Paddle payment processed successfully',
      },
      isActive: false,
    })
    .execute();
}

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'agentforge-api', timestamp: new Date().toISOString() });
});

app.get('/api/plans', (_req, res) => {
  res.json(plansCatalog);
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

app.get('/api/decisions', (_req, res) => {
  res.json(buildPortfolioSummary().decisions);
});

app.get('/api/capital-plan', (_req, res) => {
  res.json(buildPortfolioSummary().capitalPlan);
});

app.get('/api/lifecycle-governance', (_req, res) => {
  res.json(getLifecycleGovernance());
});

app.get('/api/recommendations', (_req, res) => {
  res.json(buildRecommendations());
});

app.post('/api/checkout', express.json(), async (req, res) => {
  const parsed = checkoutRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid checkout payload', details: parsed.error.flatten() });
  }

  const { planId, customerEmail } = parsed.data;
  const selectedPlan = plansCatalog.find((plan) => plan.id === planId);

  if (!selectedPlan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  if (!config.paddleApiKey) {
    return res.status(400).json({
      error: 'Paddle is not configured. Add your PADDLE_API_KEY before creating checkout sessions.',
    });
  }

  try {
    await ensurePlanCatalog();

    const checkoutUrl = await createPaddleCheckout({
      planId: selectedPlan.id,
      customerEmail,
      productName: selectedPlan.name,
    });

    return res.json({ url: checkoutUrl, sessionId: `paddle:${selectedPlan.id}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create checkout session';
    return res.status(500).json({ error: message });
  }
});

app.post('/api/paddle/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['paddle-signature'];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing Paddle signature' });
  }

  try {
    const event = verifyPaddleWebhook(req.body, signature, config.paddleWebhookSecret);

    switch (event.type) {
      case 'transaction.completed':
        await handleSuccessfulPaddlePayment(event);
        break;
      case 'subscription.created':
        console.log('Paddle subscription created');
        break;
      case 'subscription.cancelled':
        console.log('Paddle subscription cancelled');
        break;
      default:
        console.log('Unhandled Paddle event', event.type);
    }

    return res.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload';
    return res.status(400).json({ error: message });
  }
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  res.status(500).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`AgentForge API running on http://localhost:${config.port}`);
});
