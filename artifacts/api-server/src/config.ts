const port = Number(process.env.PORT ?? 5000);
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/agentforge';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? 'sk_test_your_key_here';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_your_webhook_secret_here';

export const config = {
  port,
  clientUrl,
  databaseUrl,
  stripeSecretKey,
  stripeWebhookSecret,
};
