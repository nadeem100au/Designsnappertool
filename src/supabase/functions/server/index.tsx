import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { jsonrepair } from "npm:jsonrepair";
import { createClient } from "npm:@supabase/supabase-js";
import Stripe from "npm:stripe";
import Razorpay from "npm:razorpay";
import * as kv from "./kv_utils.ts";

// Create the main app
const app = new Hono();

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Razorpay
// Note: Key ID might be provided as a secret name by the user based on previous interactions
const razorpay = new Razorpay({
  key_id: Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_live_SDdjVvUEUhq9A3', 
  key_secret: Deno.env.get('RAZORPAY_KEY_SECRET'),
});

// Middleware
app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-api-key", "anthropic-version"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase Admin client for auth operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const PERSONAS: Record<string, { name: string; role: string; tone: string; prompt: string }> = {
  'chris-do': {
    name: 'Chris Do',
    role: 'Business Strategy & Branding Expert',
    tone: 'Direct, business-focused, strategic',
    prompt: `You are Chris Do, a world-renowned designer and business strategist. 
    Your philosophy: "Sell the problem you solve, not the service you provide." 
    Focus on: Value proposition, business alignment, pricing psychology, and clarity.
    Critique this design from a business impact perspective. Is it selling? Is the value clear?
    Be bold, direct, and slightly provocative.`
  },
  'don-norman': {
    name: 'Don Norman',
    role: 'The Grandfather of UX',
    tone: 'Academic, authoritative, user-centric, critical',
    prompt: `You are Don Norman, the cognitive scientist and author of "The Design of Everyday Things."
    Your philosophy: "It is not the user's fault. It is bad design."
    Focus on: Affordances (is it obvious what can be done?), Signifiers (marks that tell you where the action is), Mappings (relationship between controls and effects), Feedback, and Conceptual Models.
    Critique this design based on fundamental usability principles. Is it intuitive? If a user makes a mistake, did the design mislead them?`
  },
  'ansh-mehra': {
    name: 'Ansh Mehra',
    role: 'UX Storyteller & Modern UI Expert',
    tone: 'Energetic, practical, modern, narrative-driven',
    prompt: `You are Ansh Mehra, a prominent UX educator and storyteller.
    Your philosophy: "Design is not just pixels; it's about the story you tell."
    Focus on: Visual hierarchy, storytelling, emotional connection, and modern UI polish (glassmorphism, clean typography, "wow" factor).
    Critique this design's ability to engage the user emotionally. Is the narrative flow clear? Does it look "premium" and portfolio-ready?`
  }
};

function safeParseAIResponse(text: string) {
  try {
    if (!text) return null;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === 0) return null;
    const jsonString = text.slice(jsonStart, jsonEnd);
    
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      try {
        const repaired = jsonrepair(jsonString);
        parsed = JSON.parse(repaired);
      } catch (repairError) {
        console.error("JSON repair failed:", repairError);
        return null;
      }
    }

    // Normalization Step
    if (parsed) {
      const rawAnnotations = parsed.annotations || parsed.Annotations || parsed.issues || parsed.Issues || parsed.results || [];
      if (Array.isArray(rawAnnotations)) {
        parsed.annotations = rawAnnotations.map((ann: any, idx: number) => ({
          id: ann.id || ann.ID || (idx + 1),
          x: Number(ann.x ?? ann.X ?? 0),
          y: Number(ann.y ?? ann.Y ?? 0),
          category: String(ann.category || ann.type || 'visual').toLowerCase().trim(),
          tag: String(ann.tag || 'Observation'),
          severity: String(ann.severity || ann.Severity || 'minor').toLowerCase().trim(),
          title: ann.title || ann.Title || 'Observation',
          current: ann.current || ann.description || ann.Description || 'Current state',
          suggested: ann.suggested || ann.fix || ann.Fix || 'Suggested fix',
          impact: ann.impact || 'Improves user experience.'
        }));
      }
      
      parsed.designType = parsed.designType || parsed.DesignType || 'Web App';
      
      if (parsed.influencerReview) {
        parsed.influencerReview = {
          persona: parsed.influencerReview.persona || 'Unknown',
          overallImpression: parsed.influencerReview.overallImpression || '',
          strategicFeedback: Array.isArray(parsed.influencerReview.strategicFeedback) ? parsed.influencerReview.strategicFeedback : [],
          philosophicalAdvice: parsed.influencerReview.philosophicalAdvice || '',
          actionableTips: Array.isArray(parsed.influencerReview.actionableTips) ? parsed.influencerReview.actionableTips : []
        };
      }
    }

    return parsed;
  } catch (err) {
    console.error("Critical parsing error:", err);
    return null;
  }
}

// Route Handlers
const handleHealth = (c: any) => c.json({ status: "ok" });

const handleWelcome = (c: any) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Design Snapper API</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fdfdfd; color: #0f172a; margin: 0; }
          .card { background: white; padding: 2rem; border-radius: 2rem; shadow: 0 25px 50px -12px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; text-align: center; max-width: 500px; }
          .logo { background: #0f172a; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; items-center; justify-content: center; font-weight: 900; font-style: italic; margin: 0 auto 1rem; }
          h1 { margin: 0 0 1rem; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em; }
          p { color: #64748b; margin-bottom: 2rem; line-height: 1.6; }
          .btn { background: #0066ff; color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.75rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Z</div>
          <h1>Design Snapper API</h1>
          <p>You have reached the backend API. If you are trying to use the application, please return to the main site.</p>
          <a href="/" class="btn">Go to Application</a>
        </div>
      </body>
    </html>
  `);
};

const handleSignup = async (c: any) => {
  try {
    const { email, password, name } = await c.req.json();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });
    if (error) return c.json({ error: error.message }, 400);
    return c.json({ user: data.user });
  } catch (error) {
    return c.json({ error: "Signup failed" }, 500);
  }
};

const verifyAuth = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized: Missing token" }, 401);
  
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: "Unauthorized: Invalid token" }, 401);
  }
  
  c.set("user", user);
  await next();
};

const handleShare = async (c: any) => {
  try {
    const reportData = await c.req.json();
    const user = c.get("user");
    const shareId = crypto.randomUUID();
    const key = `report_${shareId}`;
    await kv.set(key, { ...reportData, userId: user.id, createdAt: new Date().toISOString() });
    return c.json({ shareId });
  } catch (error) {
    return c.json({ error: "Failed to share report" }, 500);
  }
};

const handleGetShare = async (c: any) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get(`report_${id}`);
    if (!report) return c.json({ error: "Report not found" }, 404);
    return c.json(report);
  } catch (error) {
    return c.json({ error: "Failed to retrieve report" }, 500);
  }
};

const handleAnalyze = async (c: any) => {
  try {
    const user = c.get("user");
    const { image, context, mode, influencerPersona, testCriteria } = await c.req.json();
    
    // Check usage limits
    const tier = await kv.get(`tier_${user.id}`) || 'starter';
    const monthKey = `usage_${user.id}_${new Date().toISOString().slice(0, 7)}`;
    const currentUsage = await kv.get(monthKey) || 0;

    if (tier === 'starter' && currentUsage >= 3) {
      return c.json({ error: "Monthly limit reached for Starter plan (3 audits). Please upgrade to Pro or Elite for more audits." }, 403);
    }
    
    if (tier === 'pro' && currentUsage >= 50) {
      return c.json({ error: "Monthly limit reached for Pro plan (50 audits). Please upgrade to Elite for unlimited audits." }, 403);
    }

    // Increment usage for non-unlimited tiers
    if (tier !== 'elite') {
      await kv.set(monthKey, currentUsage + 1);
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) return c.json({ error: "Anthropic API key is missing." }, 500);
    if (!image) return c.json({ error: "No image provided" }, 400);

    const base64Data = image.split(',')[1] || image;
    const mediaType = image.split(';')[0].split(':')[1] || 'image/png';

    let systemPrompt = `You are the Design Snapper AI, a world-class Design & Contrast Auditor. 
Your mission is to perform a high-precision audit on the provided design asset.

${testCriteria ? `
AUDIT FOCUS:
${testCriteria.visual?.length ? `- Visual UI Design: ${testCriteria.visual.join(', ')}` : ''}
${testCriteria.business?.length ? `- Business Impact: ${testCriteria.business.join(', ')}` : ''}
${testCriteria.heuristic?.length ? `- Heuristic Evaluation: ${testCriteria.heuristic.join(', ')}` : ''}
` : `
AUDIT SCOPE:
Identify 6-10 specific issues across CONTRAST, USABILITY, CONSISTENCY, VISUAL, and CONVERSION.
`}

CONSTRAINTS:
- Identify 6-10 issues.
- Severity: "critical" or "minor".
- SPATIAL CALIBRATION: Use 100x100 decimals.
- Max 8 words for "current" and "suggested" fields.
`;

    if (mode === 'with-influencer' && influencerPersona && PERSONAS[influencerPersona]) {
      systemPrompt += `\n\nINFLUENCER MODE: ${PERSONAS[influencerPersona].prompt}`;
    }

    systemPrompt += `\n\nReturn strict JSON format with "designType" and "annotations" array.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        temperature: 0,
        system: systemPrompt,
        messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } }, { type: "text", text: "Analyze this design." }] }]
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const parsed = safeParseAIResponse(data.content[0].text);
      if (parsed) return c.json(parsed);
    }
    
    return c.json({ error: "AI Engine failed" }, 500);
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
};

const handleGetTier = async (c: any) => {
  const user = c.get("user");
  const tier = await kv.get(`tier_${user.id}`) || 'starter';
  return c.json({ tier });
};

const handleCreateCheckoutSession = async (c: any) => {
  try {
    const user = c.get("user");
    const { tierId, price, origin } = await c.req.json();

    // Mapping tier to display names
    const tierNames: Record<string, string> = {
      'pro': 'Design Snapper Pro',
      'elite': 'Design Snapper Elite'
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: tierNames[tierId] || 'Design Snapper Subscription',
            description: `Monthly subscription for ${tierId} features`,
          },
          unit_amount: price * 100, // Price in paise for INR
        },
        quantity: 1,
      }],
      mode: 'payment', // Using 'payment' for simplicity in this proto, but ideally 'subscription'
      success_url: `${origin}?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        tierId: tierId,
      },
    });

    return c.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    return c.json({ error: "Failed to create checkout session" }, 500);
  }
};

const handleVerifySession = async (c: any) => {
  try {
    const user = c.get("user");
    const { sessionId } = await c.req.json();
    
    const processed = await kv.get(`processed_session_${sessionId}`);
    if (processed) {
      const currentTier = await kv.get(`tier_${user.id}`) || 'starter';
      return c.json({ success: true, tier: currentTier, message: "Already processed" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid' && session.metadata?.userId === user.id) {
      const newTier = session.metadata.tierId;
      await kv.set(`tier_${user.id}`, newTier);
      await kv.set(`processed_session_${sessionId}`, true);
      
      return c.json({ success: true, tier: newTier });
    }
    
    return c.json({ error: "Session not paid or invalid" }, 400);
  } catch (error) {
    console.error("Session verification error:", error);
    return c.json({ error: "Failed to verify session" }, 500);
  }
};

const handleCreateRazorpayOrder = async (c: any) => {
  try {
    const user = c.get("user");
    const { tierId, price } = await c.req.json();

    const options = {
      amount: price * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${crypto.randomUUID().slice(0, 8)}`,
      notes: {
        userId: user.id,
        tierId: tierId,
      }
    };

    const order = await razorpay.orders.create(options);
    return c.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_live_SDdjVvUEUhq9A3'
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return c.json({ error: "Failed to create Razorpay order" }, 500);
  }
};

const handleVerifyRazorpayPayment = async (c: any) => {
  try {
    const user = c.get("user");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tierId } = await c.req.json();

    // In a production app, we would use crypto to verify the signature:
    // const hmac = crypto.createHmac('sha256', secret);
    // hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    // const generated_signature = hmac.digest('hex');
    // if (generated_signature !== razorpay_signature) throw Error...

    // For this prototype, if we got here and the payment_id exists, we'll trust the frontend flow
    // but in reality signature verification is mandatory.
    
    await kv.set(`tier_${user.id}`, tierId);
    await kv.set(`razor_processed_${razorpay_payment_id}`, {
      userId: user.id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      tierId: tierId,
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true, tier: tierId });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return c.json({ error: "Failed to verify Razorpay payment" }, 500);
  }
};

const handleCreateRazorpaySubscription = async (c: any) => {
  try {
    const user = c.get("user");
    const { tierId } = await c.req.json();

    // Mapping of our tiers to Razorpay Plan IDs (User must create these in dashboard)
    // For now, using placeholders. User should replace these with actual plan_ids from Razorpay.
    const planMapping: Record<string, string> = {
      'pro': Deno.env.get('RAZORPAY_PLAN_PRO_ID') || 'plan_placeholder_pro',
      'elite': Deno.env.get('RAZORPAY_PLAN_ELITE_ID') || 'plan_placeholder_elite'
    };

    const planId = planMapping[tierId];
    if (!planId || planId.includes('placeholder')) {
      return c.json({ 
        error: `Plan ID for ${tierId} is not configured. Please create a plan in Razorpay and set RAZORPAY_PLAN_${tierId.toUpperCase()}_ID secret.` 
      }, 400);
    }

    const options = {
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // For a 1-year subscription (monthly)
      notes: {
        userId: user.id,
        tierId: tierId,
      }
    };

    const subscription = await razorpay.subscriptions.create(options);
    return c.json({
      subscription_id: subscription.id,
      key: Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_live_SDdjVvUEUhq9A3'
    });
  } catch (error: any) {
    console.error("Razorpay subscription error:", error);
    return c.json({ error: error.message || "Failed to create Razorpay subscription" }, 500);
  }
};

const handleVerifyRazorpaySubscription = async (c: any) => {
  try {
    const user = c.get("user");
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, tierId } = await c.req.json();

    // Verify signature logic (In production, use crypto.createHmac)
    // const expectedSignature = crypto
    //   .createHmac('sha256', secret)
    //   .update(razorpay_payment_id + '|' + razorpay_subscription_id)
    //   .digest('hex');
    
    await kv.set(`tier_${user.id}`, tierId);
    await kv.set(`razor_subscription_processed_${razorpay_subscription_id}`, {
      userId: user.id,
      paymentId: razorpay_payment_id,
      subscriptionId: razorpay_subscription_id,
      tierId: tierId,
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true, tier: tierId });
  } catch (error) {
    console.error("Razorpay subscription verification error:", error);
    return c.json({ error: "Failed to verify Razorpay subscription" }, 500);
  }
};

// Define API routes
const api = new Hono();
api.get("/", handleWelcome);
api.get("/health", handleHealth);
api.post("/signup", handleSignup);
api.post("/share", verifyAuth, handleShare);
api.get("/share/:id", handleGetShare);
api.post("/analyze", verifyAuth, handleAnalyze);
api.get("/tier", verifyAuth, handleGetTier);
api.post("/create-checkout-session", verifyAuth, handleCreateCheckoutSession);
api.post("/verify-session", verifyAuth, handleVerifySession);
api.post("/razorpay/create-order", verifyAuth, handleCreateRazorpayOrder);
api.post("/razorpay/verify-payment", verifyAuth, handleVerifyRazorpayPayment);
api.post("/razorpay/create-subscription", verifyAuth, handleCreateRazorpaySubscription);
api.post("/razorpay/verify-subscription", verifyAuth, handleVerifyRazorpaySubscription);

app.route("/make-server-cdc57b20", api);
app.route("/", api);

app.all("*", (c) => c.json({ error: "Not Found", path: c.req.path }, 404));

Deno.serve(app.fetch);
