import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addToWaitlist = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db.query("waitlist").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (existing) return existing._id;
    return ctx.db.insert("waitlist", { email, createdAt: Date.now() });
  },
});

export const saveProfile = mutation({
  args: { linkedinUrl: v.string(), name: v.string(), headline: v.string(), profileData: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("profiles").withIndex("by_url", (q) => q.eq("linkedinUrl", args.linkedinUrl)).first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, scrapedAt: Date.now() });
      return existing._id;
    }
    return ctx.db.insert("profiles", { ...args, scrapedAt: Date.now() });
  },
});

export const saveAnalysis = mutation({
  args: { profileId: v.id("profiles"), auditData: v.any(), score: v.number(), grade: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.insert("analyses", { ...args, createdAt: Date.now() });
  },
});

export const getAnalysis = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, { profileId }) => {
    return ctx.db.query("analyses").withIndex("by_profile", (q) => q.eq("profileId", profileId)).order("desc").first();
  },
});

export const getWaitlistCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("waitlist").collect();
    return all.length;
  },
});
