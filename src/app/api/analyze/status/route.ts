import { NextRequest, NextResponse } from "next/server";
import { transformProfileAndPosts } from "@/lib/transform";
import { transformApifyTwitterData } from "@/lib/twitter-transform";
import { mockProfileA } from "@/lib/mock-data";

const APIFY_TOKEN = process.env.APIFY_TOKEN || "";

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform") || "linkedin";

  try {
    if (platform === "twitter") {
      return handleTwitterStatus(req);
    }
    return handleLinkedInStatus(req);
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ status: "complete", source: "mock", audit: mockProfileA });
  }
}

async function handleTwitterStatus(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("twitterRunId");
  const datasetId = req.nextUrl.searchParams.get("twitterDatasetId");

  if (!runId) {
    return NextResponse.json({ error: "Missing twitterRunId" }, { status: 400 });
  }

  const status = await getRunStatus(runId);

  if (status === "FAILED" || status === "ABORTED") {
    return NextResponse.json({ status: "complete", source: "mock", audit: mockProfileA });
  }

  if (status === "SUCCEEDED") {
    const items = await getDatasetItems(datasetId!);
    if (items.length === 0) {
      return NextResponse.json({ status: "complete", source: "mock", audit: mockProfileA });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audit = transformApifyTwitterData(items as any[]);
    return NextResponse.json({ status: "complete", source: "live", audit });
  }

  return NextResponse.json({ status: "running", twitterStatus: status });
}

async function handleLinkedInStatus(req: NextRequest) {
  const profileRunId = req.nextUrl.searchParams.get("profileRunId");
  const postsRunId = req.nextUrl.searchParams.get("postsRunId");
  const profileDatasetId = req.nextUrl.searchParams.get("profileDatasetId");
  const postsDatasetId = req.nextUrl.searchParams.get("postsDatasetId");

  if (!profileRunId || !postsRunId) {
    return NextResponse.json({ error: "Missing run IDs" }, { status: 400 });
  }

  const [profileStatus, postsStatus] = await Promise.all([
    getRunStatus(profileRunId),
    getRunStatus(postsRunId),
  ]);

  if (profileStatus === "FAILED" || profileStatus === "ABORTED" || postsStatus === "FAILED" || postsStatus === "ABORTED") {
    return NextResponse.json({ status: "complete", source: "mock", audit: mockProfileA });
  }

  if (profileStatus === "SUCCEEDED" && postsStatus === "SUCCEEDED") {
    const [profileItems, postsItems] = await Promise.all([
      getDatasetItems(profileDatasetId!),
      getDatasetItems(postsDatasetId!),
    ]);

    if (profileItems.length === 0) {
      return NextResponse.json({ status: "complete", source: "mock", audit: mockProfileA });
    }

    const audit = transformProfileAndPosts(profileItems[0], postsItems);
    return NextResponse.json({ status: "complete", source: "live", audit });
  }

  return NextResponse.json({ status: "running", profileStatus, postsStatus });
}

async function getRunStatus(runId: string): Promise<string> {
  const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
  const data = await res.json();
  return data.data.status;
}

async function getDatasetItems(datasetId: string): Promise<unknown[]> {
  const res = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
  if (!res.ok) return [];
  return res.json();
}
