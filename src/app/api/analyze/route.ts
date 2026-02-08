import { NextRequest, NextResponse } from "next/server";
import { scrapeLinkedInProfile, scrapeLinkedInPosts } from "@/lib/apify";
import { mockProfileA } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const { profileUrl } = await req.json();

    if (!profileUrl) {
      return NextResponse.json({ error: "profileUrl is required" }, { status: 400 });
    }

    // Try real scraping first, fall back to mock
    const profileData = await scrapeLinkedInProfile(profileUrl);
    const postsData = await scrapeLinkedInPosts(profileUrl);

    if (!profileData || !postsData) {
      // Return mock data (real scraping not configured yet)
      return NextResponse.json({
        source: "mock",
        audit: mockProfileA,
      });
    }

    // When real data is available, send to Claude for analysis
    // const analysis = await analyzeWithClaude(profileData, postsData);
    // return NextResponse.json({ source: "live", audit: analysis });

    return NextResponse.json({
      source: "live",
      profile: profileData,
      posts: postsData,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

// Ready for when Claude API is connected
// async function analyzeWithClaude(profile: unknown, posts: unknown[]) {
//   const res = await fetch("https://api.anthropic.com/v1/messages", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": process.env.ANTHROPIC_API_KEY!,
//       "anthropic-version": "2023-06-01",
//     },
//     body: JSON.stringify({
//       model: "claude-sonnet-4-20250514",
//       max_tokens: 4096,
//       messages: [{
//         role: "user",
//         content: `Analyze this LinkedIn profile and posts. Return a structured JSON audit.\n\nProfile: ${JSON.stringify(profile)}\n\nPosts: ${JSON.stringify(posts)}`
//       }],
//     }),
//   });
//   const data = await res.json();
//   return JSON.parse(data.content[0].text);
// }
