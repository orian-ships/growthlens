import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// TODO: Set up Resend API key as RESEND_API_KEY environment variable in Convex dashboard
// TODO: Set up @convex-dev/auth for proper magic link flow. For now, using simple OTP code system.

// Simple OTP store (in production, use proper auth)
// For now we use a query + mutation pattern with email-based lookup

export const sendMagicLink = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Generate a 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code (in production, store with expiry)
    // TODO: Implement proper magic link with @convex-dev/auth and Resend
    // For now, we'll use a simplified flow
    
    // TODO: Send email via Resend
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'GrowthLens <updates@growthlens.xyz>',
    //   to: email,
    //   subject: 'Your GrowthLens login code',
    //   html: `<p>Your login code is: <strong>${code}</strong></p><p>This code expires in 15 minutes.</p>`,
    // });

    console.log(`[AUTH] Magic code for ${email}: ${code}`);
    return { success: true, message: "Check your email for the login code" };
  },
});

export const loginOrCreate = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastLogin: Date.now() });
      return { userId: existing._id, isNew: false };
    }

    const userId = await ctx.db.insert("users", {
      email: email.toLowerCase(),
      trackedProfiles: [],
      createdAt: Date.now(),
      lastLogin: Date.now(),
    });
    return { userId, isNew: true };
  },
});

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();
  },
});

export const trackProfile = mutation({
  args: { userId: v.id("users"), profileUrl: v.string() },
  handler: async (ctx, { userId, profileUrl }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.trackedProfiles.length >= 5) throw new Error("Maximum 5 tracked profiles");
    if (user.trackedProfiles.includes(profileUrl)) return { success: true };

    await ctx.db.patch(userId, {
      trackedProfiles: [...user.trackedProfiles, profileUrl],
    });
    return { success: true };
  },
});

export const untrackProfile = mutation({
  args: { userId: v.id("users"), profileUrl: v.string() },
  handler: async (ctx, { userId, profileUrl }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId, {
      trackedProfiles: user.trackedProfiles.filter((p) => p !== profileUrl),
    });
    return { success: true };
  },
});

export const getTrackedProfiles = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user?.trackedProfiles || [];
  },
});
