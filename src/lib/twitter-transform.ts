/**
 * Transform Apify X/Twitter scraper data into GrowthLens ProfileAudit format
 * Actor: scraper_one/x-profile-posts-scraper
 */
import type { ProfileAudit } from './mock-data';

// Apify output shape
interface ApifyTweet {
  postText: string;
  postUrl: string;
  profileUrl: string;
  timestamp: string;
  postId: string;
  media?: unknown[];
  author: {
    name: string;
    screenName: string;
    followersCount: number;
    favouritesCount: number;
    friendsCount: number;
    description: string;
  };
  replyCount: number;
  quoteCount: number;
  repostCount: number;
  favouriteCount: number;
}

// Content pillar categories
const PILLAR_KEYWORDS: Record<string, string[]> = {
  'Thought Leadership': ['opinion', 'unpopular', 'hot take', 'controversial', 'believe', 'think', 'truth', 'myth', 'stop', 'wrong'],
  'How-To / Educational': ['how to', 'step', 'guide', 'framework', 'learn', 'tips', 'lesson', 'thread', '🧵', "here's how"],
  'Personal Stories': ['i ', 'my ', 'story', 'journey', 'failed', 'learned', 'mistake', 'personal', 'honest', 'confession'],
  'Industry News': ['new', 'report', 'study', 'research', 'data', 'trend', 'breaking', 'announced', 'launch'],
  'Case Studies': ['case study', 'result', 'growth', 'revenue', 'increased', 'decreased', 'metrics', '$', 'roi', '%'],
  'Company Updates': ['excited', 'announce', 'launch', 'ship', 'release', 'update', 'milestone', 'hit'],
  'Networking / Shoutouts': ['shoutout', 'congrats', 'amazing', 'incredible', '@', 'check out', 'follow'],
  'Career & Hiring': ['hiring', 'job', 'role', 'team', 'looking for', 'apply', 'career', 'opportunity'],
};

function classifyPillar(text: string): string {
  const lower = text.toLowerCase();
  let bestPillar = 'General';
  let bestScore = 0;
  for (const [pillar, keywords] of Object.entries(PILLAR_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestPillar = pillar; }
  }
  return bestPillar;
}

function detectHookPattern(text: string): string {
  const lower = text.toLowerCase().slice(0, 100);
  if (/^\d|^here('s| are| is)/.test(lower)) return 'Listicle';
  if (/^(i |my |we )/.test(lower)) return 'Personal';
  if (/\?/.test(lower.split('\n')[0])) return 'Question';
  if (/^(stop|don't|never|wrong|myth|unpopular)/.test(lower)) return 'Contrarian';
  if (/^(how|step|guide|framework)/.test(lower)) return 'How-To';
  if (/^(just|excited|announcing|big)/.test(lower)) return 'Announcement';
  if (/^(thread|🧵)/.test(lower)) return 'Thread';
  return 'Statement';
}

function detectContentType(tweet: ApifyTweet): string {
  const text = tweet.postText || '';
  if (text.includes('🧵') || text.toLowerCase().includes('thread')) return 'Thread';
  if (tweet.media && tweet.media.length > 1) return 'Carousel';
  if (tweet.media && tweet.media.length === 1) return 'Image';
  if (/https?:\/\//.test(text)) return 'Link';
  return 'Text';
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, val));
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function transformApifyTwitterData(tweets: ApifyTweet[]): ProfileAudit {
  if (!tweets.length) throw new Error('No tweet data returned');

  const author = tweets[0].author;
  const screenName = author.screenName;
  const followers = author.followersCount || 0;
  const following = author.friendsCount || 0;
  const bio = author.description || '';

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  // === PROFILE SCORING ===
  const bioLength = bio.length;
  const bioScore = clamp(
    (bioLength > 20 ? 20 : 0) + (bioLength > 80 ? 20 : 0) +
    (/\||-|•/.test(bio) ? 10 : 0) + (/@/.test(bio) ? 5 : 0) +
    (/http|\.com|\.io/.test(bio) ? 5 : 0) + (/\d/.test(bio) ? 10 : 0) +
    (bio.length > 120 ? 10 : 0) + 10 + 5 // assume url & location present
  );

  const completeness = clamp(
    (bio ? 25 : 0) + 15 + 15 + 10 + 15 + (tweets.length > 0 ? 20 : 0) // generous defaults
  );

  // === CONTENT ANALYSIS ===
  const tweetDates = tweets.map(t => t.timestamp ? new Date(t.timestamp).getTime() : now);
  const oldestTweet = Math.min(...tweetDates);
  const weeksSpan = Math.max(1, Math.ceil((now - oldestTweet) / weekMs));
  const postsPerWeek = tweets.length / weeksSpan;

  const weeklyFreq: number[] = new Array(12).fill(0);
  tweets.forEach(t => {
    const ts = t.timestamp ? new Date(t.timestamp).getTime() : now;
    const weeksAgo = Math.floor((now - ts) / weekMs);
    if (weeksAgo < 12) weeklyFreq[11 - weeksAgo]++;
  });

  // Content types
  const typeCount: Record<string, number> = {};
  tweets.forEach(t => { const type = detectContentType(t); typeCount[type] = (typeCount[type] || 0) + 1; });
  const typeColors: Record<string, string> = {
    Text: '#10b981', Image: '#3b82f6', Video: '#8b5cf6',
    Thread: '#f59e0b', Carousel: '#ec4899', Link: '#6366f1', GIF: '#14b8a6',
  };
  const contentTypes = Object.entries(typeCount)
    .map(([type, count]) => ({ type, percentage: Math.round((count / tweets.length) * 100), color: typeColors[type] || '#94a3b8' }))
    .sort((a, b) => b.percentage - a.percentage);

  // Content pillars
  const pillarCount: Record<string, number> = {};
  const tweetPillars = new Map<string, string>();
  tweets.forEach(t => {
    const pillar = classifyPillar(t.postText || '');
    pillarCount[pillar] = (pillarCount[pillar] || 0) + 1;
    tweetPillars.set(t.postId, pillar);
  });
  const contentPillars = Object.entries(pillarCount)
    .map(([topic, count]) => ({ topic, percentage: Math.round((count / tweets.length) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Hook patterns
  const hookCount: Record<string, number> = {};
  tweets.forEach(t => { const hook = detectHookPattern(t.postText || ''); hookCount[hook] = (hookCount[hook] || 0) + 1; });
  const hookPatterns = Object.entries(hookCount)
    .map(([pattern, count]) => ({ pattern, percentage: Math.round((count / tweets.length) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Hashtags
  const hashtagCount: Record<string, number> = {};
  let totalHashtags = 0;
  tweets.forEach(t => {
    const tags = (t.postText || '').match(/#\w+/g) || [];
    totalHashtags += tags.length;
    tags.forEach(tag => { hashtagCount[tag.toLowerCase()] = (hashtagCount[tag.toLowerCase()] || 0) + 1; });
  });
  const topHashtags = Object.entries(hashtagCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);

  // Schedule heatmap
  const schedule: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  tweets.forEach(t => {
    if (t.timestamp) {
      const d = new Date(t.timestamp);
      schedule[d.getUTCDay()][d.getUTCHours()]++;
    }
  });

  // Top posts
  const topPosts = [...tweets]
    .sort((a, b) => (b.favouriteCount || 0) - (a.favouriteCount || 0))
    .slice(0, 50)
    .map(t => ({
      text: t.postText || '',
      likes: t.favouriteCount || 0,
      comments: t.replyCount || 0,
      shares: t.repostCount || 0,
      type: detectContentType(t),
      url: t.postUrl || `https://x.com/${screenName}/status/${t.postId}`,
      pillar: tweetPillars.get(t.postId) || 'General',
      postedAt: t.timestamp ? new Date(t.timestamp).getTime() : now,
    }));

  // === ENGAGEMENT ===
  const likes = tweets.map(t => t.favouriteCount || 0);
  const comments = tweets.map(t => t.replyCount || 0);
  const shares = tweets.map(t => t.repostCount || 0);

  const avgLikes = Math.round(likes.reduce((a, b) => a + b, 0) / likes.length);
  const avgComments = Math.round(comments.reduce((a, b) => a + b, 0) / comments.length);
  const avgShares = Math.round(shares.reduce((a, b) => a + b, 0) / shares.length);

  const medianEng = median(tweets.map(t => (t.favouriteCount || 0) + (t.replyCount || 0) + (t.repostCount || 0) + (t.quoteCount || 0)));
  const engagementRate = followers > 0 ? Math.min(50, Number(((medianEng / followers) * 100).toFixed(2))) : 0;

  // === SCORING ===
  const hasBanner = true; // can't know from Apify data, assume yes
  const hasUrl = true;
  const profileScore = clamp(Math.round((completeness * 0.3) + (bioScore * 0.4) + 15 + 15));
  const typeVariety = Math.min(Object.keys(typeCount).length / 4, 1) * 30;
  const pillarVariety = Math.min(Object.keys(pillarCount).length / 5, 1) * 30;
  const hookVariety = Math.min(Object.keys(hookCount).length / 4, 1) * 20;
  const frequencyScore = clamp(postsPerWeek >= 5 ? 20 : postsPerWeek >= 3 ? 15 : postsPerWeek >= 1 ? 10 : 5);
  const contentScore = clamp(Math.round(typeVariety + pillarVariety + hookVariety + frequencyScore));
  const engScore = clamp(Math.round(
    (engagementRate >= 2 ? 40 : engagementRate >= 1 ? 30 : engagementRate >= 0.5 ? 20 : 10) +
    (avgLikes >= 50 ? 20 : avgLikes >= 20 ? 15 : avgLikes >= 5 ? 10 : 5) +
    (avgComments >= 10 ? 20 : avgComments >= 5 ? 15 : avgComments >= 2 ? 10 : 5) +
    (avgShares >= 10 ? 20 : avgShares >= 5 ? 15 : avgShares >= 2 ? 10 : 5)
  ));
  const activeWeeks = weeklyFreq.filter(w => w > 0).length;
  const consistencyScore = clamp(Math.round((activeWeeks / 12) * 100));
  const hashtagDiscipline = clamp(totalHashtags / Math.max(tweets.length, 1) <= 3 ? 30 : totalHashtags / Math.max(tweets.length, 1) <= 5 ? 20 : 10);
  const strategyScore = clamp(Math.round(pillarVariety + hookVariety + hashtagDiscipline));

  const overallScore = Math.round(
    profileScore * 0.2 + contentScore * 0.25 + engScore * 0.25 + consistencyScore * 0.15 + strategyScore * 0.15
  );
  const overallGrade = overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 55 ? 'C' : overallScore >= 40 ? 'D' : 'F';

  return {
    profile: {
      name: author.name,
      headline: bio || `@${screenName}`,
      url: `https://x.com/${screenName}`,
      followers,
      connections: following,
      profileImageUrl: '',
      completenessScore: completeness,
      headlineAnalysis: {
        formula: bio.includes('|') || bio.includes('•') ? 'Structured with separators' : bio.length > 100 ? 'Detailed narrative' : 'Brief statement',
        effectiveness: bioScore,
        suggestion: bioScore < 60 ? 'Add specifics: who you help, what you do, and proof' : bioScore < 80 ? 'Consider adding a clear value proposition or CTA' : 'Strong bio — keep it updated',
      },
      aboutAnalysis: {
        hasHook: /^(i |stop|how|why|\d|the |here)/i.test(bio),
        hasCTA: /dm|follow|link|check|subscribe|join/i.test(bio),
        structure: bio.includes('\n') ? 'Multi-line with breaks' : 'Single paragraph',
        score: bioScore,
      },
      bannerAssessment: { hasBanner, quality: 'Banner data not available from X scraper', score: 50 },
      featuredSection: { hasItems: false, count: 0, types: [] },
      experienceFraming: {
        actionOriented: /built|shipped|grew|scaled|founded|created/i.test(bio),
        metricsUsed: /\d/.test(bio),
        score: clamp((/built|shipped|grew|scaled|founded|created/i.test(bio) ? 40 : 10) + (/\d/.test(bio) ? 30 : 0) + (bio.length > 80 ? 20 : 0)),
      },
    },
    contentStrategy: {
      postsPerWeek: Number(postsPerWeek.toFixed(1)),
      weeklyFrequency: weeklyFreq,
      contentTypes,
      contentPillars,
      topPosts,
      hookPatterns,
      hashtagStrategy: { avg: tweets.length > 0 ? Number((totalHashtags / tweets.length).toFixed(1)) : 0, topHashtags },
      postingSchedule: schedule,
    },
    engagement: { avgLikes, avgComments, avgShares, engagementRate },
    overallGrade,
    overallScore,
    breakdown: [
      { category: 'Profile', score: profileScore, max: 100 },
      { category: 'Content', score: contentScore, max: 100 },
      { category: 'Engagement', score: engScore, max: 100 },
      { category: 'Consistency', score: consistencyScore, max: 100 },
      { category: 'Strategy', score: strategyScore, max: 100 },
    ],
  };
}
