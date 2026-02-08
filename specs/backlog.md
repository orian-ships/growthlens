# GrowthLens Backlog

## Agent API / MCP Integration
**Priority:** High (future)
**Description:** GrowthLens should be usable by AI agents, not just humans. If an agent manages a LinkedIn account, it should be able to check stats/progress over time programmatically.

**Requirements:**
- REST API with API key auth (no OAuth flow — agents can't click buttons)
- Endpoints: run audit, get audit results, get trends/history, list tracked profiles
- MCP (Model Context Protocol) server so agents can call GrowthLens as a tool
- Rate limiting per API key
- Same data as the web UI — no dumbed-down version

**Use cases:**
- Agent runs weekly audit on its own LinkedIn, adjusts content strategy based on scores
- Agent compares its profile against competitors and adapts
- Agent tracks progress over time, reports to its operator
- Multiple agents using GrowthLens as a shared growth intelligence layer

**Open questions:**
- API key provisioned per account, or separate developer keys?
- MCP hosted by us or self-hostable?
- Should agents be able to trigger re-scrapes on demand or only consume scheduled audit data?
