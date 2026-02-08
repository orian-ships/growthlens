import { internalAction } from "./_generated/server";
import { v } from "convex/values";

// TODO: Set RESEND_API_KEY in Convex environment variables
// TODO: Set up DNS records for growthlens.xyz (SPF, DKIM, DMARC) in Resend dashboard

export const sendDigestEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (_ctx, { to, subject, html }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`[EMAIL] Skipping send to ${to} — no RESEND_API_KEY configured`);
      console.log(`[EMAIL] Subject: ${subject}`);
      return { success: false, reason: "no_api_key" };
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "GrowthLens <updates@growthlens.xyz>",
          to: [to],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`[EMAIL] Resend error:`, err);
        return { success: false, reason: err };
      }

      const data = await res.json();
      console.log(`[EMAIL] Sent to ${to}, id: ${data.id}`);
      return { success: true, id: data.id };
    } catch (err) {
      console.error(`[EMAIL] Failed to send:`, err);
      return { success: false, reason: String(err) };
    }
  },
});
