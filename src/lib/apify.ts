const APIFY_TOKEN = process.env.APIFY_TOKEN || "";
const USE_MOCK = process.env.USE_MOCK_DATA !== "false"; // default to mock

const PROFILE_ACTOR = "curious_coder/linkedin-profile-scraper";
const POSTS_ACTOR = "curious_coder/linkedin-posts-scraper"; // replace with actual actor

interface ApifyRunResult {
  id: string;
  defaultDatasetId: string;
}

export async function runApifyActor(actorId: string, input: Record<string, unknown>): Promise<ApifyRunResult> {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) throw new Error(`Apify run failed: ${res.status}`);
  const data = await res.json();
  return { id: data.data.id, defaultDatasetId: data.data.defaultDatasetId };
}

export async function waitForRun(runId: string, timeoutMs = 120000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const data = await res.json();
    if (data.data.status === "SUCCEEDED") return;
    if (data.data.status === "FAILED" || data.data.status === "ABORTED") {
      throw new Error(`Apify run ${data.data.status}`);
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error("Apify run timeout");
}

export async function getDatasetItems(datasetId: string): Promise<unknown[]> {
  const res = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
  if (!res.ok) throw new Error(`Dataset fetch failed: ${res.status}`);
  return res.json();
}

export async function scrapeLinkedInProfile(profileUrl: string) {
  if (USE_MOCK) return null; // caller should use mock data

  const run = await runApifyActor(PROFILE_ACTOR, {
    profileUrls: [profileUrl],
    // cookie: process.env.LINKEDIN_COOKIE, // add when available
  });
  await waitForRun(run.id);
  const items = await getDatasetItems(run.defaultDatasetId);
  return items[0] || null;
}

export async function scrapeLinkedInPosts(profileUrl: string) {
  if (USE_MOCK) return null;

  const run = await runApifyActor(POSTS_ACTOR, {
    profileUrls: [profileUrl],
    maxPosts: 50,
    // cookie: process.env.LINKEDIN_COOKIE,
  });
  await waitForRun(run.id);
  return getDatasetItems(run.defaultDatasetId);
}
