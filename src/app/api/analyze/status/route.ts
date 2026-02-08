import { NextRequest, NextResponse } from "next/server";
import { transformProfileAndPosts } from "@/lib/transform";
import { mockProfileA } from "@/lib/mock-data";

const APIFY_TOKEN = process.env.APIFY_TOKEN || "";

export async function GET(req: NextRequest) {
  const profileRunId = req.nextUrl.searchParams.get("profileRunId");
  const postsRunId = req.nextUrl.searchParams.get("postsRunId");
  const profileDatasetId = req.nextUrl.searchParams.get("profileDatasetId");
  const postsDatasetId = req.nextUrl.searchParams.get("postsDatasetId");

  if (!profileRunId || !postsRunId) {
    return NextResponse.json({ error: "Missing run IDs" }, { status: 400 });
  }

  try {
    // Check both run statuses
    const [profileStatus, postsStatus] = await Promise.all([
      getRunStatus(profileRunId),
      getRunStatus(postsRunId),
    ]);

    // If either failed, return mock
    if (profileStatus === "FAILED" || profileStatus === "ABORTED" || postsStatus === "FAILED" || postsStatus === "ABORTED") {
      return NextResponse.json({ status: "complete", source: "mock", audit: mockProfileA });
    }

    // If both succeeded, fetch data and transform
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

    // Still running
    return NextResponse.json({
      status: "running",
      profileStatus,
      postsStatus,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ status: "complete", source: "mock", audit: mockProfileA });
  }
}

async function getRunStatus(runId: string): Promise<string> {
  const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
  const data = await res.json();
  return data.data.status;
}

async function getDatasetItems(datasetId: string): Promise<any[]> {
  const res = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
  if (!res.ok) return [];
  return res.json();
}
