import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// API key for write operations — must match CONVEX_API_SECRET env var on Vercel
const API_SECRET = process.env.GROWTHLENS_API_SECRET || "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function corsPreflightHandler() {
  return httpAction(async () => new Response(null, { headers: CORS_HEADERS }));
}

/** Verify API key on write endpoints. Returns error Response or null if valid. */
function verifyApiKey(req: Request): Response | null {
  const key = req.headers.get("X-API-Key") || "";
  if (!API_SECRET) return null; // No secret configured = skip check (dev mode)
  if (key !== API_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

// ============================================================
// PUBLIC READ ENDPOINTS (no auth)
// ============================================================

// Get audit by ID
http.route({
  path: "/api/get-audit",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);
    const audit = await ctx.runQuery(api.audits.getById, { id: id as any });
    if (!audit) return json({ error: "Not found" }, 404);
    return json(audit);
  }),
});

// List audits
http.route({
  path: "/api/list-audits",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const audits = await ctx.runQuery(api.audits.list, { limit });
    return json(audits);
  }),
});

// Audit count
http.route({
  path: "/api/audit-count",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const count = await ctx.runQuery(api.audits.count, {});
    return json({ count });
  }),
});

// Get comparison by ID
http.route({
  path: "/api/get-comparison",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);
    const comp = await ctx.runQuery(api.comparisons.getById, { id: id as any });
    if (!comp) return json({ error: "Not found" }, 404);
    return json(comp);
  }),
});

// List comparisons
http.route({
  path: "/api/list-comparisons",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const comps = await ctx.runQuery(api.comparisons.list, { limit });
    return json(comps);
  }),
});

// Get feedback for an audit
http.route({
  path: "/api/feedback/check",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const auditId = url.searchParams.get("auditId");
    if (!auditId) return json({ error: "Missing auditId" }, 400);
    const fb = await ctx.runQuery(api.feedback.getByAuditId, { auditId });
    return json(fb || null);
  }),
});

// Get approved testimonials
http.route({
  path: "/api/testimonials",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 20);
    const testimonials = await ctx.runQuery(api.feedback.getApprovedTestimonials, { limit });
    return json(testimonials);
  }),
});

// ============================================================
// PROTECTED WRITE ENDPOINTS (require X-API-Key header)
// ============================================================

// Store audit
http.route({
  path: "/api/store-audit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const err = verifyApiKey(req);
    if (err) return err;
    const body = await req.json();
    const id = await ctx.runMutation(api.audits.store, body);
    return json({ id });
  }),
});

http.route({ path: "/api/store-audit", method: "OPTIONS", handler: corsPreflightHandler() });

// Store comparison
http.route({
  path: "/api/store-comparison",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const err = verifyApiKey(req);
    if (err) return err;
    const body = await req.json();
    const id = await ctx.runMutation(api.comparisons.store, body);
    return json({ id });
  }),
});

http.route({ path: "/api/store-comparison", method: "OPTIONS", handler: corsPreflightHandler() });

// Waitlist join — rate limit by requiring origin check
http.route({
  path: "/api/waitlist-join",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const origin = req.headers.get("origin") || "";
    const allowedOrigins = ["growthlens.xyz", "growthlens-blue.vercel.app", "localhost"];
    if (!allowedOrigins.some(o => origin.includes(o))) {
      return json({ error: "Forbidden" }, 403);
    }
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return json({ error: "Invalid email" }, 400);
    }
    const id = await ctx.runMutation(api.waitlist.join, { email });
    return json({ id });
  }),
});

http.route({ path: "/api/waitlist-join", method: "OPTIONS", handler: corsPreflightHandler() });

// Submit feedback — origin check
http.route({
  path: "/api/feedback",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const origin = req.headers.get("origin") || "";
    const allowedOrigins = ["growthlens.xyz", "growthlens-blue.vercel.app", "localhost"];
    if (!allowedOrigins.some(o => origin.includes(o))) {
      return json({ error: "Forbidden" }, 403);
    }
    const body = await req.json();
    const id = await ctx.runMutation(api.feedback.submit, body);
    return json({ id });
  }),
});

http.route({ path: "/api/feedback", method: "OPTIONS", handler: corsPreflightHandler() });

// LinkedIn OAuth login — API key required
http.route({
  path: "/api/auth/linkedin-login",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const err = verifyApiKey(req);
    if (err) return err;
    const { email, name, linkedinSub, picture } = await req.json();
    if (!email) return json({ error: "email required" }, 400);

    const existing = await ctx.runQuery(api.users.getByEmail, { email });
    let userId: string;

    if (existing) {
      await ctx.runMutation(api.users.updateLogin, {
        id: existing._id,
        name,
        linkedinSub,
        picture,
        lastLogin: Date.now(),
      });
      userId = existing._id;
    } else {
      userId = await ctx.runMutation(api.users.create, {
        email,
        name,
        linkedinSub,
        picture,
        trackedProfiles: [],
        createdAt: Date.now(),
        lastLogin: Date.now(),
      });
    }

    return json({ userId });
  }),
});

http.route({ path: "/api/auth/linkedin-login", method: "OPTIONS", handler: corsPreflightHandler() });

export default http;
