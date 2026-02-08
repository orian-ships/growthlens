/**
 * Weekly email digest template for GrowthLens.
 * Returns HTML string ready to send via Resend.
 */

interface EmailDigestParams {
  profileName: string;
  score: number;
  previousScore: number;
  highlight: string;     // e.g. "Your engagement rate jumped 40% this week 🔥"
  actionItem: string;    // e.g. "Try posting 2 more times this week"
  auditUrl: string;      // Link to the full audit
  unsubscribeUrl: string;
}

export function generateEmailDigest(params: EmailDigestParams): { subject: string; html: string } {
  const { profileName, score, previousScore, highlight, actionItem, auditUrl, unsubscribeUrl } = params;
  const delta = score - previousScore;
  const deltaStr = delta > 0 ? `↑${delta}` : delta < 0 ? `↓${Math.abs(delta)}` : "→0";
  const deltaColor = delta > 0 ? "#10b981" : delta < 0 ? "#ef4444" : "#94a3b8";

  const subject = `Your LinkedIn score this week: ${score} (${deltaStr})`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#10b981;font-size:24px;margin:0;">GrowthLens</h1>
      <p style="color:#94a3b8;font-size:14px;margin:8px 0 0;">Weekly LinkedIn Score Report</p>
    </div>

    <!-- Score Card -->
    <div style="background:#111827;border-radius:16px;padding:32px;text-align:center;border:1px solid rgba(255,255,255,0.06);margin-bottom:24px;">
      <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">${profileName}&apos;s score</p>
      <div style="font-size:64px;font-weight:800;color:#fff;line-height:1;">${score}</div>
      <div style="font-size:20px;font-weight:600;color:${deltaColor};margin-top:8px;">${deltaStr} from last week</div>
      <div style="color:#64748b;font-size:13px;margin-top:4px;">Previous: ${previousScore}</div>
    </div>

    <!-- Highlight -->
    <div style="background:#111827;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.06);margin-bottom:16px;">
      <p style="color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">🔥 This Week&apos;s Highlight</p>
      <p style="color:#e2e8f0;font-size:15px;margin:0;line-height:1.5;">${highlight}</p>
    </div>

    <!-- Action Item -->
    <div style="background:#111827;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.06);margin-bottom:32px;">
      <p style="color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">🎯 Action Item</p>
      <p style="color:#e2e8f0;font-size:15px;margin:0;line-height:1.5;">${actionItem}</p>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:40px;">
      <a href="${auditUrl}" style="display:inline-block;background:#10b981;color:#0a0e1a;font-weight:700;font-size:16px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        See Full Report →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
      <p style="color:#475569;font-size:12px;margin:0;">
        You&apos;re receiving this because you track profiles on GrowthLens.<br>
        <a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}
