/**
 * Content Pillar Classifier
 * Classifies LinkedIn posts into one of 10 fixed content pillars
 * using keyword/pattern matching.
 */

export const PILLARS = [
  "Thought Leadership",
  "Industry News",
  "Personal Stories",
  "How-To / Educational",
  "Company Updates",
  "Culture & Values",
  "Engagement Bait",
  "Case Studies",
  "Networking / Shoutouts",
  "Career & Hiring",
] as const;

export type ContentPillar = (typeof PILLARS)[number];

const PILLAR_PATTERNS: Record<ContentPillar, { keywords: string[]; patterns: RegExp[] }> = {
  "Thought Leadership": {
    keywords: [
      "opinion", "hot take", "framework", "prediction", "unpopular", "controversial",
      "believe", "future of", "my take", "here's why", "the truth about", "myth",
      "overrated", "underrated", "disagree", "contrarian", "bold claim", "perspective",
      "paradigm", "shift", "rethink", "wrong about", "misunderstand",
    ],
    patterns: [
      /\bhot take\b/i, /\bunpopular opinion\b/i, /\bhere'?s (the thing|why|what)\b/i,
      /\bstop (saying|doing|believing)\b/i, /\bthe future of\b/i, /\bmost people (don'?t|think|get)\b/i,
      /\bi ('?m |)convinced\b/i, /\bcontrary to\b/i, /\bwake.?up call\b/i,
    ],
  },
  "Industry News": {
    keywords: [
      "report", "study", "research", "trend", "industry", "market", "update",
      "announcement", "breaking", "just released", "new data", "survey", "findings",
      "according to", "published", "quarter", "growth rate", "sector",
    ],
    patterns: [
      /\b(new|latest) (report|study|research|data)\b/i, /\baccording to\b/i,
      /\bindustry (trend|news|update)\b/i, /\bmarket (update|report|trend)\b/i,
      /\bjust (released|published|announced)\b/i, /\b20\d{2} (report|trend|outlook)\b/i,
    ],
  },
  "Personal Stories": {
    keywords: [
      "journey", "lesson", "learned", "story", "vulnerability", "failed", "failure",
      "mistake", "struggle", "honest", "confession", "real talk", "years ago",
      "looking back", "memoir", "turning point", "rock bottom", "breakthrough",
    ],
    patterns: [
      /\b(i|we) (failed|struggled|learned|lost|quit|was fired|got rejected)\b/i,
      /\bmy (journey|story|biggest mistake|lesson)\b/i,
      /\b\d+ years ago\b/i, /\blooking back\b/i, /\bhere'?s what (happened|i learned)\b/i,
      /\bhonest(ly)?\b.*\b(share|admit|confess)\b/i, /\bvulnerable\b/i,
    ],
  },
  "How-To / Educational": {
    keywords: [
      "how to", "tutorial", "guide", "step", "tips", "trick", "hack",
      "learn", "teach", "explain", "breakdown", "cheat sheet", "template",
      "playbook", "blueprint", "101", "beginner", "advanced", "masterclass",
    ],
    patterns: [
      /\bhow (to|i)\b/i, /\bstep[- ]by[- ]step\b/i, /\b\d+ (tips|ways|steps|tricks|hacks)\b/i,
      /\bhere'?s (how|a guide|my playbook)\b/i, /\bcheat sheet\b/i,
      /\bdo this\b.*\binstead\b/i, /\b(beginner|complete|ultimate) guide\b/i,
    ],
  },
  "Company Updates": {
    keywords: [
      "launch", "shipped", "milestone", "product", "feature", "release",
      "update", "v2", "beta", "raised", "funding", "revenue", "arr",
      "customers", "users", "announcement", "excited to share",
    ],
    patterns: [
      /\b(we|i) (just |)(launched|shipped|released|built|raised|hit)\b/i,
      /\bexcited to (announce|share)\b/i, /\b(new feature|product update)\b/i,
      /\b(series [a-d]|seed round|funding)\b/i, /\b\$\d+[mk]\b/i,
      /\b\d+k?\+? (users|customers|subscribers)\b/i,
    ],
  },
  "Culture & Values": {
    keywords: [
      "culture", "team", "values", "diversity", "inclusion", "workplace",
      "remote", "hybrid", "mental health", "wellbeing", "burnout", "balance",
      "toxic", "healthy", "environment", "belonging", "dei",
    ],
    patterns: [
      /\b(team|company) culture\b/i, /\bwork[- ]life balance\b/i,
      /\bmental health\b/i, /\bburnout\b/i, /\bdiversity\b/i,
      /\binclusion\b/i, /\bremote (work|team)\b/i, /\btoxic (workplace|culture)\b/i,
    ],
  },
  "Engagement Bait": {
    keywords: [
      "poll", "agree", "disagree", "thoughts", "comment below", "tag someone",
      "repost", "share this", "who else", "am i the only", "hot take",
    ],
    patterns: [
      /\bagree or disagree\b/i, /\bcomment (below|your)\b/i, /\btag (someone|a friend)\b/i,
      /\bwho else\b/i, /\bam i the only\b/i, /\bthoughts\s*[?👇⬇️]/i,
      /\brepost if\b/i, /\blike if\b/i, /\byes or no\b/i, /\bwhich one\b/i,
      /👇|⬇️/, /\bpoll\b/i,
    ],
  },
  "Case Studies": {
    keywords: [
      "case study", "results", "testimonial", "client", "customer", "roi",
      "before and after", "transformation", "outcome", "success story", "win",
      "helped", "grew", "increased", "decreased", "saved",
    ],
    patterns: [
      /\bcase study\b/i, /\b(client|customer) (win|result|story|success)\b/i,
      /\b(grew|increased|boosted|saved|reduced).*\b\d+%/i,
      /\bbefore.*(and|→|->).*after\b/i, /\b(from|went) \$?\d+.*to \$?\d+\b/i,
      /\bROI\b/, /\btestimonial\b/i,
    ],
  },
  "Networking / Shoutouts": {
    keywords: [
      "shoutout", "congratulations", "congrats", "grateful", "thankful",
      "event", "conference", "meetup", "panel", "speaking", "honored",
      "inspired by", "thank you", "appreciate",
    ],
    patterns: [
      /\b(shout ?out|s\/o) (to|for)\b/i, /\bcongrat(ulation)?s\b/i,
      /\bthank(s| you)\b.*\b@/i, /\bgreat (event|conference|meetup|panel)\b/i,
      /\bhonored to\b/i, /\binspired by\b/i, /\b(amazing|incredible) (team|people|group)\b/i,
    ],
  },
  "Career & Hiring": {
    keywords: [
      "hiring", "job", "career", "resume", "interview", "salary", "offer",
      "recruit", "open role", "apply", "position", "opportunity", "candidate",
      "linkedin", "job search", "promotion", "layoff",
    ],
    patterns: [
      /\b(we'?re |i'?m |)hiring\b/i, /\bjob (post|opening|alert|search)\b/i,
      /\bopen (role|position)\b/i, /\bapply (now|here|today)\b/i,
      /\b(resume|cv) tip\b/i, /\binterview (tip|advice|prep)\b/i,
      /\bcareer advice\b/i, /\blayoff\b/i, /\b(got|received) (an |the |)offer\b/i,
    ],
  },
};

/**
 * Classify a post's content into one of 10 fixed content pillars.
 * Returns the pillar name with the highest match score.
 * Falls back to "Thought Leadership" if no strong match.
 */
export function classifyPost(content: string): ContentPillar {
  if (!content || content.trim().length === 0) return "Thought Leadership";

  const lower = content.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [pillar, { keywords, patterns }] of Object.entries(PILLAR_PATTERNS)) {
    let score = 0;

    for (const kw of keywords) {
      if (lower.includes(kw)) score += 2;
    }

    for (const pat of patterns) {
      if (pat.test(content)) score += 3;
    }

    scores[pillar] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  // Require minimum confidence
  if (sorted[0][1] < 2) return "Thought Leadership";

  return sorted[0][0] as ContentPillar;
}

/**
 * Get pillar distribution from an array of post contents.
 * Returns sorted array of { pillar, count, percentage }.
 */
export function getPillarDistribution(posts: { text: string; pillar?: string }[]): { pillar: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {};
  for (const pillar of PILLARS) counts[pillar] = 0;

  for (const post of posts) {
    const pillar = post.pillar || classifyPost(post.text);
    counts[pillar] = (counts[pillar] || 0) + 1;
  }

  const total = posts.length || 1;
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([pillar, count]) => ({ pillar, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}
