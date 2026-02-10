import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    auditId: v.string(),
    profileUrl: v.string(),
    rating: v.union(v.literal("positive"), v.literal("negative")),
    comment: v.optional(v.string()),
    testimonial: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedback", {
      ...args,
      approved: false,
      createdAt: Date.now(),
    });
  },
});

export const getApprovedTestimonials = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .order("desc")
      .take(args.limit ?? 10);
  },
});

export const getByAuditId = query({
  args: { auditId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_auditId", (q) => q.eq("auditId", args.auditId))
      .first();
  },
});
