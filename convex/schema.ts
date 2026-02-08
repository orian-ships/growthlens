import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    linkedinUrl: v.string(),
    name: v.string(),
    headline: v.string(),
    profileData: v.any(),
    scrapedAt: v.number(),
  }).index("by_url", ["linkedinUrl"]),

  analyses: defineTable({
    profileId: v.id("profiles"),
    auditData: v.any(),
    score: v.number(),
    grade: v.string(),
    createdAt: v.number(),
  }).index("by_profile", ["profileId"]),

  comparisons: defineTable({
    profileA: v.id("profiles"),
    profileB: v.id("profiles"),
    gapAnalysis: v.any(),
    createdAt: v.number(),
  }),

  waitlist: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
