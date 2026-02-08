import type { ProfileAudit } from "./mock-data";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function transformProfileAndPosts(profile: any, posts: any[]): ProfileAudit {
  // --- Profile fields (harvestapi format) ---
  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Unknown";
  const headline = profile.headline || "";
  const publicId = profile.publicIdentifier || "";
  const followers = profile.followerCount || 0;
  const connections = profile.connectionsCount || 500;

  // Profile completeness
  const hasAbout = !!profile.about;
  const hasBanner = !!profile.backgroundPicture;
  const hasPhoto = !!profile.profilePicture?.url;
  const hasExperience = (profile.currentPosition?.length || 0) > 0;
  const hasEducation = (profile.profileTopEducation?.length || 0) > 0;
  const hasSkills = !!profile.topSkills;
  const completenessItems = [hasAbout, hasBanner, hasPhoto, hasExperience, hasEducation, hasSkills, !!headline];
  const completenessScore = Math.round((completenessItems.filter(Boolean).length / completenessItems.length) * 100);

  // Headline analysis
  const headlineParts = headline.split(/[|·•,]/).map((s: string) => s.trim()).filter(Boolean);
  const headlineFormula = headlineParts.length >= 3 ? "Role + Niche + Value" : headlineParts.length === 2 ? "Role + Niche" : "Basic";
  const headlineEffectiveness = Math.min(95, headlineParts.length * 25 + (headline.length > 40 ? 15 : 0));

  // About analysis
  const aboutText = profile.about || "";
  const hasHook = aboutText.length > 0 && /^[A-Z🔥🚀💡✨I]/.test(aboutText.trim());
  const hasCTA = /contact|reach|email|book|schedule|connect|DM|link|visit/i.test(aboutText);
  const aboutScore = Math.min(100, (aboutText.length > 50 ? 30 : 10) + (hasHook ? 25 : 0) + (hasCTA ? 25 : 0) + (aboutText.length > 200 ? 20 : aboutText.length > 100 ? 10 : 0));

  // Experience framing
  const expScore = hasExperience ? 65 : 20;
  const actionOriented = /led|built|grew|launched|increased|managed|created|designed|developed|building/i.test(aboutText + " " + headline);
  const metricsUsed = /\d+%|\$\d|[0-9]+x|million|thousand|\d+\+/i.test(aboutText + " " + headline);

  // --- Posts analysis (harvestapi/linkedin-profile-posts format) ---
  const postCount = posts.length || 1;

  // Engagement: posts have engagement.likes, engagement.comments, engagement.shares
  const totalLikes = posts.reduce((sum: number, p: any) => sum + (p.engagement?.likes || 0), 0);
  const totalComments = posts.reduce((sum: number, p: any) => sum + (p.engagement?.comments || 0), 0);
  const totalShares = posts.reduce((sum: number, p: any) => sum + (p.engagement?.shares || 0), 0);
  const avgLikes = Math.round(totalLikes / postCount);
  const avgComments = Math.round(totalComments / postCount);
  const avgShares = Math.round(totalShares / postCount);
  const engagementRate = followers > 0 ? Math.round(((totalLikes + totalComments) / postCount / followers) * 10000) / 100 : 0;

  // Content types — check for postImages, type field, etc.
  const typeMap: Record<string, number> = {};
  posts.forEach((p: any) => {
    let type = "text";
    if (p.postImages?.length > 0) type = "image";
    else if (p.type === "article" || p.header?.text) type = "article";
    else if (p.content?.includes("carousel") || p.type === "carousel") type = "carousel";
    else if (p.content?.includes("video") || p.type === "video") type = "video";
    else if (p.content?.includes("poll") || p.type === "poll") type = "poll";
    typeMap[type] = (typeMap[type] || 0) + 1;
  });
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];
  const contentTypes = Object.entries(typeMap).map(([type, count], i) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    percentage: Math.round((count / postCount) * 100),
    color: colors[i % colors.length],
  }));
  if (contentTypes.length === 0) contentTypes.push({ type: "Text", percentage: 100, color: colors[0] });

  // Weekly frequency from post timestamps
  const weeklyFrequency: number[] = new Array(12).fill(0);
  const now = Date.now();
  posts.forEach((p: any) => {
    const ts = p.postedAt?.timestamp || 0;
    if (ts) {
      const weeksAgo = Math.floor((now - ts) / (7 * 24 * 3600 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 12) weeklyFrequency[11 - weeksAgo]++;
    }
  });
  const activeWeeks = weeklyFrequency.filter(w => w > 0).length || 1;
  const postsPerWeek = Math.round((postCount / activeWeeks) * 10) / 10;

  // Hashtags from post content
  const allText = posts.map((p: any) => p.content || "").join(" ");
  const hashtagMatches = allText.match(/#\w+/g) || [];
  const hashtagCounts: Record<string, number> = {};
  hashtagMatches.forEach((tag: string) => { hashtagCounts[tag.toLowerCase()] = (hashtagCounts[tag.toLowerCase()] || 0) + 1; });
  const topHashtags = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag);
  const avgHashtags = postCount > 0 ? Math.round(hashtagMatches.length / postCount) : 0;

  // Top posts by engagement
  const sortedPosts = [...posts].sort((a: any, b: any) =>
    ((b.engagement?.likes || 0) + (b.engagement?.comments || 0)) -
    ((a.engagement?.likes || 0) + (a.engagement?.comments || 0))
  );
  const topPosts = sortedPosts.slice(0, 5).map((p: any) => ({
    text: (p.content || "").slice(0, 150) + ((p.content || "").length > 150 ? "..." : ""),
    likes: p.engagement?.likes || 0,
    comments: p.engagement?.comments || 0,
    shares: p.engagement?.shares || 0,
    type: p.postImages?.length ? "image" : p.type || "text",
  }));

  // Hook patterns from first line
  const hookTypes: Record<string, number> = { Question: 0, Statement: 0, Story: 0, Statistic: 0, Contrarian: 0 };
  posts.forEach((p: any) => {
    const firstLine = (p.content || "").split("\n")[0] || "";
    if (firstLine.includes("?")) hookTypes.Question++;
    else if (/\d+%|\d+ out of|\$/.test(firstLine)) hookTypes.Statistic++;
    else if (/^(I |My |When I|Here's my)/i.test(firstLine)) hookTypes.Story++;
    else if (/stop|don't|never|wrong|myth|unpopular|hot take/i.test(firstLine)) hookTypes.Contrarian++;
    else hookTypes.Statement++;
  });
  const hookPatterns = Object.entries(hookTypes)
    .filter(([, v]) => v > 0)
    .map(([pattern, count]) => ({ pattern, percentage: Math.round((count / postCount) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Posting schedule heatmap (7 days x 24 hours)
  const schedule: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  posts.forEach((p: any) => {
    const ts = p.postedAt?.timestamp || 0;
    if (ts) {
      const d = new Date(ts);
      schedule[d.getDay()][d.getHours()]++;
    }
  });

  // Content pillars from common meaningful words
  const stopWords = new Set(["people", "about", "their", "would", "which", "there", "think", "these", "being", "should", "really", "still", "every", "doing", "thing", "could", "don't", "that's", "what's", "doesn", "those", "where", "other", "going", "never", "makes"]);
  const words = allText.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter((w: string) => w.length > 5 && !stopWords.has(w));
  const wordCounts: Record<string, number> = {};
  words.forEach((w: string) => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
  const contentPillars = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic: topic.charAt(0).toUpperCase() + topic.slice(1), percentage: Math.min(60, Math.round((count / words.length) * 100 * 5)) }));

  // --- Scoring ---
  const profileScore = Math.round((completenessScore + headlineEffectiveness + aboutScore + Math.min(100, expScore)) / 4);
  const contentScore = Math.min(100, Math.round(postsPerWeek * 15 + contentTypes.length * 10 + (contentPillars.length > 2 ? 20 : 10)));
  const engagementScore = Math.min(100, Math.round(engagementRate * 10 + (avgComments > 5 ? 20 : avgComments > 1 ? 10 : 5)));
  const consistencyScore = Math.min(100, Math.round(postsPerWeek >= 3 ? 70 : postsPerWeek >= 1 ? 45 : 20) + (weeklyFrequency.filter(w => w > 0).length > 8 ? 30 : weeklyFrequency.filter(w => w > 0).length > 4 ? 15 : 0));
  const strategyScore = Math.min(100, Math.round((contentPillars.length > 2 ? 30 : 15) + (hookPatterns.length > 2 ? 30 : 15) + (avgHashtags > 0 && avgHashtags < 6 ? 20 : 10)));

  const overallScore = Math.round((profileScore + contentScore + engagementScore + consistencyScore + strategyScore) / 5);
  const overallGrade = overallScore >= 85 ? "A" : overallScore >= 70 ? "B" : overallScore >= 55 ? "C" : overallScore >= 40 ? "D" : "F";

  const growthEstimate = postsPerWeek >= 4 && engagementRate > 2 ? "+15-25% / month" :
    postsPerWeek >= 2 && engagementRate > 1 ? "+8-15% / month" :
    postsPerWeek >= 1 ? "+3-8% / month" : "Stagnant";

  return {
    profile: {
      name,
      headline,
      url: `https://linkedin.com/in/${publicId}`,
      followers,
      connections,
      profileImageUrl: profile.profilePicture?.url || "",
      completenessScore,
      headlineAnalysis: { formula: headlineFormula, effectiveness: headlineEffectiveness, suggestion: headlineEffectiveness < 70 ? "Add your unique value proposition and target audience" : "Strong headline — consider A/B testing variations" },
      aboutAnalysis: { hasHook, hasCTA, structure: hasHook && hasCTA ? "Hook → Story → CTA" : hasHook ? "Hook → Content" : "Flat", score: aboutScore },
      bannerAssessment: { hasBanner, quality: hasBanner ? "Custom banner detected" : "Default/missing banner — add a branded banner with your value prop", score: hasBanner ? 70 : 15 },
      featuredSection: { hasItems: false, count: 0, types: [] },
      experienceFraming: { actionOriented, metricsUsed, score: Math.min(100, expScore + (actionOriented ? 15 : 0) + (metricsUsed ? 15 : 0)) },
    },
    contentStrategy: {
      postsPerWeek,
      weeklyFrequency,
      contentTypes,
      contentPillars,
      topPosts,
      hookPatterns,
      hashtagStrategy: { avg: avgHashtags, topHashtags },
      postingSchedule: schedule,
    },
    engagement: {
      avgLikes,
      avgComments,
      avgShares,
      engagementRate,
      replyRate: Math.min(100, Math.round(avgComments > 0 ? (avgComments / (avgLikes + 1)) * 100 : 0)),
      avgReplyTime: "~2-4 hours",
      growthEstimate,
    },
    overallScore,
    overallGrade,
    breakdown: [
      { category: "Profile", score: profileScore, max: 100 },
      { category: "Content", score: contentScore, max: 100 },
      { category: "Engagement", score: engagementScore, max: 100 },
      { category: "Consistency", score: consistencyScore, max: 100 },
      { category: "Strategy", score: strategyScore, max: 100 },
    ],
  };
}
