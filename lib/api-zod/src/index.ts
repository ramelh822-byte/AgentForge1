import { z } from 'zod';

export const checkoutRequestSchema = z.object({
  planId: z.string().min(1),
  customerEmail: z.string().email().optional(),
});

export const webhookEventSchema = z.object({
  type: z.string(),
  id: z.string(),
  data: z.any(),
});

export const workflowRunSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['queued', 'running', 'succeeded', 'failed']).default('queued'),
  payload: z.record(z.any()).optional(),
});
