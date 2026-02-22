
import { Hono } from 'jsr:@hono/hono';
import { cors } from 'jsr:@hono/hono/cors';
import Razorpay from 'npm:razorpay@2.9.2';
import { crypto } from "https://deno.land/std@0.210.0/crypto/mod.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();
app.use('/*', cors());

const PRO_AMOUNT_INR = 500;
const PRO_AMOUNT_USD = 9;
const PRO_CREDITS = 30;
const PRO_MONEY_INR = 500;

// Fixed amounts allowed for Pro plan
const VALID_PRO_AMOUNTS: Record<string, number> = { 'INR': PRO_AMOUNT_INR, 'USD': PRO_AMOUNT_USD };

// Admin DB client (service role, bypasses RLS)
const adminClient = () => createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Validate user JWT and return user object
async function getUserFromToken(token: string) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// ---- POST /order — create Razorpay order ----
app.post('*/order', async (c) => {
    console.log(`[Order] ${c.req.path}`);
    try {
        const { amount, currency = 'INR', receipt, accessToken } = await c.req.json();

        // Validate fixed amount
        const validAmount = VALID_PRO_AMOUNTS[currency.toUpperCase()];
        if (!validAmount || amount !== validAmount) {
            return c.json({ error: `Invalid amount. Pro plan costs ${currency === 'USD' ? '$9' : '₹500'} only.` }, 400);
        }

        const key_id = Deno.env.get('RAZORPAY_KEY_ID');
        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');
        if (!key_id || !key_secret) return c.json({ error: 'Razorpay keys not configured' }, 500);

        const razorpay = new Razorpay({ key_id, key_secret });
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // paise
            currency,
            receipt,
            payment_capture: 1,
        });

        // Pre-create a pending transaction row if user is identified
        if (accessToken) {
            const user = await getUserFromToken(accessToken);
            if (user) {
                await adminClient().from('transactions').insert({
                    user_id: user.id,
                    amount,
                    currency: currency.toUpperCase(),
                    status: 'pending',
                    razorpay_order_id: order.id,
                });
            }
        }

        return c.json(order);
    } catch (error) {
        console.error('[Order] Error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// ---- POST /verify — verify payment signature and upgrade user ----
app.post('*/verify', async (c) => {
    console.log(`[Verify] ${c.req.path}`);
    try {
        const body = await c.req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, accessToken } = body;

        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');
        const key_id = Deno.env.get('RAZORPAY_KEY_ID');
        if (!key_secret || !key_id) return c.json({ error: 'Razorpay secrets missing' }, 500);

        // 1. Verify signature
        const generated_signature = await hmacSha256(key_secret, razorpay_order_id + '|' + razorpay_payment_id);
        if (generated_signature !== razorpay_signature) {
            return c.json({ status: 'failure', error: 'Signature verification failed' }, 400);
        }

        // 2. Get user from accessToken in body
        if (!accessToken) return c.json({ error: 'Access token required' }, 401);
        const user = await getUserFromToken(accessToken);
        if (!user) return c.json({ error: 'Invalid or expired token' }, 401);

        // 3. Fetch order details from Razorpay (secure — not trusting client amount)
        const razorpay = new Razorpay({ key_id, key_secret });
        const order = await razorpay.orders.fetch(razorpay_order_id);
        const amount = order.amount / 100;
        const currency = order.currency;

        const db = adminClient();

        // 4. Record successful transaction
        const { error: txError } = await db.from('transactions').upsert({
            user_id: user.id,
            amount,
            currency,
            status: 'success',
            razorpay_order_id,
            razorpay_payment_id,
            plan_upgraded_to: 'pro',
        }, { onConflict: 'razorpay_order_id' });

        if (txError) console.error('[Verify] Transaction insert error:', txError.message);

        // 5. Upgrade user_plan to Pro (upsert — handles both new and existing rows)
        const { error: planError } = await db.from('user_plan').upsert({
            user_id: user.id,
            plan: 'pro',
            status: 'active',
            audits_used: 0,
            credits_remaining: PRO_CREDITS,
            total_credits: PRO_CREDITS,
            money_remaining: PRO_MONEY_INR,
            plan_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (planError) {
            console.error('[Verify] Plan upgrade error:', planError.message);
        } else {
            console.log(`User ${user.email} upgraded to Pro (${PRO_CREDITS} credits, ₹${PRO_MONEY_INR})`);
        }

        // 6. Ensure profile exists
        const { data: existingProfile } = await db.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
        if (!existingProfile) {
            await db.from('profiles').insert({ user_id: user.id, email: user.email });
        }

        return c.json({ status: 'success', payment_id: razorpay_payment_id, plan: 'pro', creditsRemaining: PRO_CREDITS });

    } catch (error) {
        console.error('[Verify] Error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// HMAC SHA256 helper (Web Crypto API — works in Deno)
async function hmacSha256(key: string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        'raw', encoder.encode(key),
        { name: 'HMAC', hash: 'SHA-256' },
        false, ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(app.fetch);
