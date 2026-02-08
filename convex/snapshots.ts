import { v } from "convex/values";
import { mutation, query, internalAction, internalMutation } from "./_generated/server";
// import { internal } from "./_generated/api";

export const storeSnapshot = mutation({
  args: {
    userId: v.id("users"),
    profileUrl: v.string(),
    auditData: v.string(),
    overallScore: v.number(),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditSnapshots", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getSnapshots = query({
  args: { userId: v.id("users"), profileUrl: v.optional(v.string()) },
  handler: async (ctx, { userId, profileUrl }) => {
    if (profileUrl) {
      return await ctx.db
        .query("auditSnapshots")
        .withIndex("by_userId_profileUrl", (q) => q.eq("userId", userId).eq("profileUrl", profileUrl))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("auditSnapshots")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

/**
 * Weekly re-audit cron job (NOT activated — build the function only).
 * When activated, this should run every Monday at 8:00 AM UTC.
 * 
 * To activate, add to convex/crons.ts:
 * import { cronJobs } from "convex/server";
 * const crons = cronJobs();
 * crons.weekly("weekly-reaudit", { dayOfWeek: "monday", hourUTC: 8, minuteUTC: 0 }, internal.snapshots.weeklyReaudit);
 * export default crons;
 */
export const weeklyReaudit = internalAction({
  args: {},
  handler: async (ctx) => {
    // 1. Get all users with tracked profiles
    // const users = await ctx.runQuery(internal.snapshots.getUsersWithTracking);
    
    // 2. For each user, for each tracked profile:
    //    a. Call Apify to scrape the profile
    //    b. Run the scoring engine
    //    c. Store the audit snapshot
    //    d. Compute diff from previous week
    //    e. Send email digest via Resend
    
    const weekNumber = getISOWeek(new Date());
    console.log(`[CRON] Weekly re-audit triggered for week ${weekNumber}`);
    
    // TODO: Implement when activating cron
    // for (const user of users) {
    //   for (const profileUrl of user.trackedProfiles) {
    //     try {
    //       // Scrape via Apify
    //       // Score
    //       // Store snapshot
    //       await ctx.runMutation(internal.snapshots.storeSnapshotInternal, {
    //         userId: user._id,
    //         profileUrl,
    //         auditData: JSON.stringify(auditResult),
    //         overallScore: auditResult.overallScore,
    //         weekNumber,
    //       });
    //       // Send email digest
    //     } catch (err) {
    //       console.error(`[CRON] Failed to audit ${profileUrl} for ${user.email}:`, err);
    //     }
    //   }
    // }
  },
});

export const storeSnapshotInternal = internalMutation({
  args: {
    userId: v.id("users"),
    profileUrl: v.string(),
    auditData: v.string(),
    overallScore: v.number(),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditSnapshots", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Helper query for the cron job
export const getUsersWithTracking = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter((u) => u.trackedProfiles.length > 0);
  },
});
