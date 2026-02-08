# GrowthLens Audit V2 Spec

## Problem

The current audit is a one-shot static report. Users get a score, glance at it, and leave. There's no reason to come back, no way to track progress, and no way to understand how they stack up. The audit shows only 5 posts with no sorting, uses naive content categorization (word frequency), and doesn't connect the user to a comparison flow.

Without these features, GrowthLens is a novelty tool, not a growth engine. We need users to create accounts, come back weekly, and bring others in through comparisons.

## Solution Overview

Transform the audit from a one-shot report into a living dashboard with:
- Full post library with sorting
- Content pillar classification (fixed taxonomy)
- Inline benchmarking against user-nominated profiles
- Account system (magic link) for persistence
- Weekly automated re-audits with trend tracking
- Email digest driving users back to the site

## Detailed Requirements

### 1. Post Library (Sortable)

Display ALL scraped posts (up to 50), not just top 5. Scrollable list with sort controls.

**Sort options:**
- Most likes (default)
- Most comments
- Most shares
- Highest engagement rate (likes + comments / follower count — finds posts that punched above their weight)
- Most recent

**Each post shows:**
- Content preview (first 150 chars)
- Post type badge (text, image, article, carousel, video)
- Likes, comments, shares counts
- "↗ View on LinkedIn" link
- Content pillar tag (see below)

**UI:** Sort dropdown at top of section. Posts in a scrollable container, maybe with "Show more" pagination (show 10, load 10 more).

### 2. Content Pillars (Fixed Taxonomy)

Replace the current word-frequency "content pillars" with a fixed set of 8-10 categories. Each post gets classified into one primary pillar.

**Standard pillars:**
1. **Thought Leadership** — Opinions, hot takes, frameworks, predictions
2. **Industry News** — Sharing/commenting on industry events, trends, reports
3. **Personal Stories** — Founder journey, lessons learned, vulnerability posts
4. **How-To / Educational** — Tutorials, tips, step-by-step guides
5. **Company Updates** — Product launches, milestones, hiring, announcements
6. **Culture & Values** — Team culture, diversity, workplace topics
7. **Engagement Bait** — Polls, questions, "agree or disagree?", tag-a-friend
8. **Case Studies** — Client wins, results, before/after, testimonials
9. **Networking / Shoutouts** — Tagging others, congratulations, event recaps
10. **Career & Hiring** — Job posts, career advice, recruitment content

**Classification approach:** Keyword + pattern matching on post content. Each post gets one primary pillar. Show distribution as a donut/bar chart.

**Display:**
- Donut chart showing pillar distribution
- Each post in the library tagged with its pillar
- Filter posts by pillar in the library

### 3. Compare CTA

At the bottom of every single audit page, add a section:

> **See how you stack up**
> Compare [Profile Name]'s strategy against another LinkedIn profile.
> [Input field: LinkedIn URL] [Compare →]

Clicking "Compare" navigates to `/compare` with the audited profile pre-filled as Profile A.

### 4. Benchmarking Language

When a user has compared their profile against others (via the compare feature or tracked competitors), surface benchmark insights throughout the audit:

**Where benchmarks appear:**
- Next to engagement rate: "Your engagement rate is 1.8%. Across your 3 benchmarked profiles, the average is 3.2%."
- Next to posting frequency: "You post 2.1x/week. Your benchmarks average 4.3x/week."
- Next to overall score: "Your score of 62 ranks 3rd out of 4 tracked profiles."
- On each breakdown category: a small indicator showing above/below benchmark average

**Data source:** Only compared/tracked profiles. No fabricated industry averages.

**When no benchmarks exist:** Don't show benchmark language. Show a subtle CTA: "Compare against others to see how you rank."

### 5. Account System (Magic Link)

**Provider:** Convex Auth (built-in, no third-party service)

**Flow:**
1. User enters email → receives magic link/code
2. Clicking link logs them in, creates account if new
3. Session persists via cookie/token

**Account stores:**
- Email
- Tracked profile URLs (up to 5)
- Audit history (links to audit records in Convex)
- Comparison history
- Created at, last login

**Where login is required:**
- Subscribing to weekly tracking (must have account)
- Viewing historical audits ("My Audits" dashboard)

**Where login is NOT required:**
- Running a one-off audit
- Running a one-off comparison
- Viewing a shared audit URL

### 6. Weekly Tracking (Monday Re-Audits)

**Setup:** Logged-in user clicks "Track this profile" on any audit. Profile gets added to their tracked list (max 5 total including their own).

**Execution:** Every Monday at 8:00 AM UTC, a Convex cron job:
1. Iterates all subscribed users
2. For each user, re-scrapes all tracked profiles (Apify)
3. Runs the scoring engine on each
4. Stores new audit snapshots linked to the user
5. Computes diff from previous week
6. Triggers email digest

**Cost model:** ~$0.03/subscriber/week (5 profiles × $0.006 per profile+posts scrape)

**Trends Dashboard (`/dashboard/trends`):**
- Line chart: overall score over time (weekly data points)
- Line chart: engagement rate over time
- Line chart: posting frequency over time
- All tracked profiles overlaid on same charts (different colors)
- Date range: last 4 weeks, 8 weeks, 12 weeks

**Weekly Diff:**
- Score delta with arrow (↑ 62 → 68)
- Per-category deltas (Content +8, Engagement -2)
- Notable changes: "You posted 3x more this week" or "Engagement rate dropped 15%"

### 7. Email Digest (Resend)

**Provider:** Resend (free tier: 100 emails/day)
**From:** updates@growthlens.xyz

**Sent:** Every Monday after re-audits complete

**Content (teaser, not full report):**
- Subject: "Your LinkedIn score this week: 68 (↑6)"
- Body:
  - Overall score with delta
  - One highlight: "Your engagement rate jumped 40% this week 🔥"
  - One action item from recommendations
  - CTA button: "See Full Report →" linking to latest audit
- Footer: unsubscribe link

### 8. Domain Setup

- **Domain:** growthlens.xyz
- **Vercel:** Add as custom domain alias (replace growthlens-blue.vercel.app)
- **Email:** Configure DNS for Resend (SPF, DKIM, DMARC on growthlens.xyz)

## Technical Approach

### Stack
- **Frontend:** Next.js 16 + Tailwind v4 (existing)
- **Backend:** Convex (existing project: patient-toucan-352)
- **Auth:** Convex Auth (magic link)
- **Email:** Resend API (called from Convex actions)
- **Scraping:** Apify harvestapi actors (existing)
- **Scoring:** Modular scoring engine in `src/lib/scoring/` (existing)

### New Convex Schema Additions
```
users: {
  email: string,
  trackedProfiles: string[], // LinkedIn URLs, max 5
  createdAt: number,
  lastLogin: number,
}

auditSnapshots: {
  userId: Id<"users">,
  profileUrl: string,
  auditData: string, // JSON
  overallScore: number,
  weekNumber: number, // ISO week
  createdAt: number,
}
```

### New API Routes
- `POST /api/auth/magic-link` — Send magic link
- `POST /api/auth/verify` — Verify magic link code
- `POST /api/track` — Add profile to tracking list
- `DELETE /api/track` — Remove profile from tracking
- `GET /api/trends?profileUrl=...` — Get historical snapshots
- `GET /api/dashboard` — Get user's tracked profiles + latest audits

### Content Pillar Classification
Keyword-based classifier in `src/lib/scoring/pillar-classifier.ts`. Each pillar has a set of trigger words/patterns. Posts are scored against each pillar, highest score wins. Falls back to "Thought Leadership" if no strong match.

### Cron Job
Convex scheduled function running every Monday 8:00 UTC:
1. Query all users with trackedProfiles.length > 0
2. For each profile URL, call Apify via HTTP action
3. Run scoring engine
4. Store auditSnapshot
5. Compute diff
6. Call Resend API with digest email

## Out of Scope

- Payment / pricing tiers
- Prebuilt industry benchmark index
- LinkedIn OAuth / direct API access
- AI-written content suggestions
- Auto-posting or scheduling
- Mobile app
- Real-time notifications (only weekly email)
- Post scheduling recommendations

## Edge Cases & Error Handling

- **Apify scrape fails on Monday:** Retry once after 1 hour. If still fails, skip that profile for the week, email user "We couldn't scrape [profile] this week."
- **User tracks a private/nonexistent profile:** Show error on track attempt: "This profile couldn't be found or is private."
- **User deletes account:** Remove all tracking, keep anonymous audit records (for shared URLs).
- **Post has no content (image-only):** Show "[Image post]" as text, still classify by any caption text.
- **Zero posts in last 12 weeks:** Show "No recent posts found" in post library, flag in recommendations.
- **Magic link expires:** 15-minute expiry. Show "Link expired, request a new one."
- **User exceeds 5 tracked profiles:** Disable "Track" button, show "You're tracking the maximum of 5 profiles. Remove one to add another."
- **Content pillar classification confidence is low:** Tag as "General" rather than force a bad classification.

## Success Criteria

1. **Engagement:** Users who create accounts return at least 2x in the first month
2. **Tracking adoption:** 20%+ of account holders track at least 1 profile
3. **Email open rate:** >30% on weekly digests
4. **Comparison flow:** 15%+ of single audits lead to a comparison
5. **Data accuracy:** No fabricated metrics. Every number traces to real Apify data or clearly labeled as "based on tracked profiles"

## Open Questions

1. Should we show the post library on shared audit URLs, or gate it behind login?
2. Do we need a "public profile" concept where tracked users can share their trends page?
3. Where does growthlens.xyz DNS currently live? (Need access for Vercel + Resend DNS records)
4. Should weekly digests include competitor movement too? ("Your competitor X gained 12 points this week")
