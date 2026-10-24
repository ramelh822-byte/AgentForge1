import { pgTable, serial, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  priceLabel: text('price_label').notNull(),
  stripePriceId: text('stripe_price_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  customerId: serial('customer_id').notNull(),
  planId: serial('plan_id').notNull(),
  stripeSessionId: text('stripe_session_id'),
  stripeInvoiceId: text('stripe_invoice_id'),
  status: text('status').notNull().default('pending'),
  metadata: jsonb('metadata'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workflowRuns = pgTable('workflow_runs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull().default('queued'),
  payload: jsonb('payload'),
  result: jsonb('result'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const opportunitySearches = pgTable('opportunity_searches', {
  id: serial('id').primaryKey(),
  niche: text('niche').notNull(),
  summary: text('summary').notNull(),
  demandScore: integer('demand_score').notNull().default(0),
  competitionScore: integer('competition_score').notNull().default(0),
  monetizationScore: integer('monetization_score').notNull().default(0),
  automationScore: integer('automation_score').notNull().default(0),
  riskScore: integer('risk_score').notNull().default(0),
  totalScore: integer('total_score').notNull().default(0),
  status: text('status').notNull().default('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const businessAssets = pgTable('business_assets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  niche: text('niche').notNull(),
  assetType: text('asset_type').notNull(),
  traffic: integer('traffic').notNull().default(0),
  monthlyRevenue: integer('monthly_revenue').notNull().default(0),
  automationScore: integer('automation_score').notNull().default(0),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
