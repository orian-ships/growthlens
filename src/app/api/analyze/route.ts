import { NextRequest, NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_TOKEN || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileUrl, platform = "linkedin" } = body;
    if (!profileUrl) {
      return NextResponse.json({ error: "profileUrl is required" }, { status: 400 });
    }

    if (!APIFY_TOKEN) {
      return NextResponse.json({ error: "APIFY_TOKEN not configured", source: "mock" }, { status: 200 });
    }

    if (platform === "twitter") {
      // Extract handle from URL or @handle
      const handle = profileUrl.replace(/^@/, "").replace(/https?:\/\/(x\.com|twitter\.com)\//, "").replace(/\/.*$/, "").trim();
      const run = await startActor("scraper_one/x-profile-posts-scraper", {
        profileUrls: [`https://x.com/${handle}`],
        tweetsDesired: 50,
      });

      return NextResponse.json({
        status: "running",
        platform: "twitter",
        twitterRunId: run.id,
        twitterDatasetId: run.datasetId,
      });
    }

    // LinkedIn: kick off both runs in parallel
    const [profileRun, postsRun] = await Promise.all([
      startActor("harvestapi/linkedin-profile-scraper", { urls: [profileUrl] }),
      startActor("harvestapi/linkedin-profile-posts", { profileUrls: [profileUrl], maxPosts: 50 }),
    ]);

    return NextResponse.json({
      status: "running",
      platform: "linkedin",
      profileRunId: profileRun.id,
      postsRunId: postsRun.id,
      profileDatasetId: profileRun.datasetId,
      postsDatasetId: postsRun.datasetId,
    });
  } catch (error) {
    console.error("Analysis start error:", error);
    return NextResponse.json({ error: "Failed to start analysis" }, { status: 500 });
  }
}

async function startActor(actorId: string, input: Record<string, unknown>) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${APIFY_TOKEN}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }
  );
  if (!res.ok) throw new Error(`Apify start failed: ${res.status}`);
  const data = await res.json();
  return { id: data.data.id, datasetId: data.data.defaultDatasetId };
}
