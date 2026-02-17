import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { jsonrepair } from "npm:jsonrepair";
import * as kv from "./kv_utils.ts";
import { S3Client, PutObjectCommand, GetObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const app = new Hono();

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

      // Normalize Influencer Review if present
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

app.get("/make-server-cdc57b20/health", (c) => c.json({ status: "ok" }));

app.post("/make-server-cdc57b20/share", async (c) => {
  try {
    const reportData = await c.req.json();
    const shareId = crypto.randomUUID();
    const key = `report_${shareId}`;
    await kv.set(key, { ...reportData, createdAt: new Date().toISOString() });
    return c.json({ shareId });
  } catch (error) {
    return c.json({ error: "Failed to share report" }, 500);
  }
});

app.get("/make-server-cdc57b20/share/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const report = await kv.get(`report_${id}`);
    if (!report) return c.json({ error: "Report not found" }, 404);
    return c.json(report);
  } catch (error) {
    return c.json({ error: "Failed to retrieve report" }, 500);
  }
});

app.post("/make-server-cdc57b20/analyze", async (c) => {
  try {
    const { image, context, mode, influencerPersona, testCriteria } = await c.req.json();
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicKey) {
      console.error("Missing ANTHROPIC_API_KEY environment variable");
      return c.json({ error: "Server configuration error: Anthropic API key is missing. Please add it to the Supabase secrets." }, 500);
    }

    if (!image) {
      return c.json({ error: "No image provided" }, 400);
    }

    const base64Data = image.split(',')[1] || image;
    const mediaType = image.split(';')[0].split(':')[1] || 'image/png';

    // Construct the System Prompt
    let systemPrompt = `You are the Design Snapper AI, a world-class Design & Contrast Auditor. 
Your mission is to perform a high-precision audit on the provided design asset.

${testCriteria ? `
AUDIT FOCUS (The user has selected specific criteria to test against):
${testCriteria.visual?.length ? `- Visual UI Design: ${testCriteria.visual.join(', ')}` : ''}
${testCriteria.business?.length ? `- Business Impact: ${testCriteria.business.join(', ')}` : ''}
${testCriteria.heuristic?.length ? `- Heuristic Evaluation: ${testCriteria.heuristic.join(', ')}` : ''}

You MUST prioritize your findings based on these selected categories and the individual principles mentioned.
` : `
AUDIT SCOPE:
You must identify 6-10 specific issues across these exact categories:
1. CONTRAST: WCAG 2.1 compliance, text legibility, color-blind accessibility.
2. USABILITY: Information architecture, interaction patterns, cognitive load.
3. CONSISTENCY: UI patterns, spacing systems, radius harmony, icon stroke weights.
4. VISUAL: Balance, white space, color theory, alignment precision, visual hierarchy.
5. CONVERSION: Sales triggers, value proposition clarity, CTA prominence.
`}

CONSTRAINTS:
- Identify exactly 6-10 issues.
- Severity must be "critical" (major failure/accessibility block) or "minor" (visual polish).

SPATIAL CALIBRATION (ULTRA-PRECISION REQUIRED):
- Use a 100x100 coordinate system where (0,0) is TOP-LEFT and (100,100) is BOTTOM-RIGHT.
- Provide coordinates as DECIMALS (e.g., "x": 42.58, "y": 18.21) for maximum precision.
- THE COORDINATES MUST BE THE EXACT CENTER OF THE ELEMENT OR PIXEL-FAILURE YOU ARE DISCUSSING.
- Center markers directly on the specific UI element (e.g., the center of a button, the middle of a text line).
- For spacing issues, place the marker in the center of the gap.
- Your (x,y) coordinates map directly to percentage offsets from the top-left edge of the image file.

LANGUAGE & TONE:
- Be BLUNT, PROFESSIONAL, and DIRECT. Use expert terminology.
- "current": Technical description of the visual failure.
- "suggested": Precise expert fix with actionable values.
`;

    // Add Influencer Logic if requested
    let influencerPromptSection = "";
    if (mode === 'with-influencer' && influencerPersona && typeof influencerPersona === 'string' && PERSONAS[influencerPersona]) {
      const persona = PERSONAS[influencerPersona];
      influencerPromptSection = `
      
INFLUENCER MODE ACTIVATED:
${persona.prompt}

You must ALSO provide a structured review from the perspective of ${persona.name}.
Channel their voice, style, and specific focus areas.
`;
    }

    systemPrompt += influencerPromptSection;

    systemPrompt += `

OUTPUT FORMAT (Strict JSON):
{
  "designType": "Web App" | "Mobile" | "Poster" | "Marketing",
  "annotations": [
    {
      "id": number,
      "x": number,
      "y": number,
      "category": "visual" | "business" | "heuristic" | "contrast",
      "tag": "Hierarchy" | "Consistency" | "Spacing" | "Contrast" | "Balance" | "Conversion" | "Clarity" | "Trust" | "Efficiency" | "Differentiation" | "Visibility" | "Prevention" | "Control" | "Recognition" | "Feedback",
      "severity": "critical" | "minor",
      "title": "A statement of the issue.",
      "current": "Max 8 words description of the specific visual error.",
      "suggested": "Max 8 words specific technical solution (e.g., 'Change to #222222').",
      "impact": "Direct statement of the strategic benefit."
    }
  ]${mode === 'with-influencer' ? `,
  "influencerReview": {
    "persona": "${(influencerPersona && typeof influencerPersona === 'string' && PERSONAS[influencerPersona]) ? PERSONAS[influencerPersona].name : 'Expert'}",
    "overallImpression": "A paragraph summarizing the design from the persona's perspective.",
    "strategicFeedback": ["Point 1", "Point 2", "Point 3"],
    "philosophicalAdvice": "A deep, guiding principle relevant to this specific design.",
    "actionableTips": ["Tip 1", "Tip 2"]
  }` : ''}
}`;

    // Try Anthropic (Sole AI Engine for Vision/Reasoning)
    if (anthropicKey) {
      try {
        // We'll try a list of models in order of preference (best vision first)
        const modelsToTry = [
          "claude-opus-4-5-20251101",
          "claude-3-haiku-20240307"
        ];

        let lastError = "";

        for (const model of modelsToTry) {
          console.log(`Attempting audit with model: ${model}`);
          try {
            const userMessageContent = [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              {
                type: "text", text: `High-precision Design Audit: Please analyze this image and identify specific UI/UX and Contrast issues. 
              
CALIBRATION RULE: 
- Coordinates must be exact decimals.
- Markers must be centered on the specific visual element.
- Do not guess; if an element's location is ambiguous, do not annotate it.
- (0,0) is the absolute top-left pixel.
- (100,100) is the absolute bottom-right pixel.

${context ? `Context: ${context}` : ''} 

Return the audit in the specified JSON format.` }
            ];

            const response = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01"
              },
              body: JSON.stringify({
                model: model,
                max_tokens: 4096,
                temperature: 0,
                system: systemPrompt,
                messages: [
                  {
                    role: "user",
                    content: userMessageContent,
                  },
                ],
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const parsed = safeParseAIResponse(data.content[0].text);
              if (parsed && (parsed.annotations?.length > 0 || parsed.influencerReview)) {
                console.log(`Successfully used model: ${model}`);
                return c.json({ ...parsed, mode: 'ai', modelUsed: model });
              }
            } else {
              const errorBody = await response.text();
              lastError = errorBody;
              console.warn(`Model ${model} failed with: ${errorBody}`);
              // Continue to next model if it's a "not found" or "permission" error
            }
          } catch (e) {
            console.error(`Fetch error for ${model}:`, e);
            lastError = String(e);
          }
        }

        // If we exhausted all models
        return c.json({
          error: `AI Vision Engine failed to find an available model. Latest error: ${lastError}`,
          mode: 'failed'
        }, 500);

      } catch (e) {
        console.error("Anthropic engine critical failure:", e);
      }
    }

    // Last Resort: If we reach here, it means all AI models failed or returned no annotations.
    return c.json({
      error: "The AI Vision Engine was unable to generate a valid audit for this design. This usually happens if the API key has insufficient credits or the image format is unsupported.",
      mode: 'failed'
    }, 500);
  } catch (error) {
    console.error("Critical server error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/make-server-cdc57b20/plugin-upload", async (c) => {
  try {
    const { image } = await c.req.json();
    if (!image) return c.json({ error: "No image provided" }, 400);

    // Get AWS Config from environment variables
    // Set via Supabase Dashboard: Settings -> Edge Functions -> Secrets
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const region = Deno.env.get("AWS_REGION") || "ap-south-1";
    const bucketName = Deno.env.get("S3_BUCKET_NAME") || "designsnapper-uploads";

    if (!accessKeyId || !secretAccessKey) {
      console.error("Missing AWS credentials in environment");
      return c.json({ error: "Server configuration error: AWS credentials not set. Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to Supabase Edge Function secrets." }, 500);
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Prepare File
    const base64Data = image.split(',')[1] || image;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const uploadId = crypto.randomUUID();
    const key = `plugin-uploads/${uploadId}.png`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: binaryData,
      ContentType: "image/png",
    });

    await s3Client.send(command);

    // Generate presigned URL (valid for 1 hour) since bucket has Block Public Access
    const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const s3Url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    return c.json({ uploadId, url: s3Url });
  } catch (error) {
    console.error("Plugin upload error:", error);
    return c.json({ error: "Failed to upload image" }, 500);
  }
});

app.get("/make-server-cdc57b20/plugin-upload/:id", async (c) => {
  try {
    const id = c.req.param('id');

    // Get AWS Config
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const region = Deno.env.get("AWS_REGION") || "ap-south-1";
    const bucketName = Deno.env.get("S3_BUCKET_NAME") || "designsnapper-uploads";

    if (!accessKeyId || !secretAccessKey) {
      return c.json({ error: "AWS credentials not configured" }, 500);
    }

    const s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    // Fetch image from S3
    const key = `plugin-uploads/${id}.png`;
    const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await s3Client.send(getCommand);

    // Convert to base64 data URL
    const bodyBytes = await response.Body?.transformToByteArray();
    if (!bodyBytes) return c.json({ error: "Image not found" }, 404);

    const base64 = btoa(String.fromCharCode(...bodyBytes));
    const dataUrl = `data:image/png;base64,${base64}`;

    return c.json({ image: dataUrl });
  } catch (error: any) {
    console.error("Plugin upload fetch error:", error);
    if (error?.name === 'NoSuchKey') {
      return c.json({ error: "Upload not found" }, 404);
    }
    return c.json({ error: "Failed to retrieve upload" }, 500);
  }
});

app.post("/make-server-cdc57b20/chat", async (c) => {
  try {
    const { messages, persona, context } = await c.req.json();
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicKey) {
      return c.json({ error: "Anthropic API key not configured" }, 500);
    }

    const influencer = PERSONAS[persona];
    // 1. Validate Persona
    if (!influencer) {
      return c.json({ error: "Invalid persona" }, 400);
    }

    // 2. Strict Message Validation (Anthropic Requirement: First message MUST be 'user')
    // Filter out any system/assistant messages at the start
    let apiMessages = Array.isArray(messages) ? messages : [];

    // Remove leading non-user messages
    while (apiMessages.length > 0 && apiMessages[0].role !== 'user') {
      apiMessages.shift();
    }

    // If no valid user message remains, fail gracefully
    if (apiMessages.length === 0) {
      return c.json({ error: "Conversation must start with a user message." }, 400);
    }

    const systemPrompt = `You are ${influencer.name}, ${influencer.role}.
    Your tone is ${influencer.tone}.
    
    CONTEXT:
    ${influencer.prompt}

    The user is asking you questions about a design you just audited.
    
    Here is the context of the audit you performed:
    ${JSON.stringify(context)}
    
    Answer the user's questions based on your persona and the audit results.
    Be helpful, specific, and stay in character.
    Keep responses concise and conversational.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5-20251101",
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages
      })
    });

    if (response.ok) {
      const data = await response.json();
      return c.json({ message: data.content[0].text });
    } else {
      const errorText = await response.text();
      console.error("Chat API error:", errorText);
      return c.json({ error: `Failed to generate response: ${errorText}` }, 500);
    }
  } catch (error) {
    console.error("Chat server error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);