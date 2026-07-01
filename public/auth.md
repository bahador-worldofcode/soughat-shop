# Soughat Shop — Agent & API Access

> This file follows the emerging `/auth.md` convention for AI agent
> and automated-client onboarding. Machine-readable discovery
> endpoints (`/.well-known/*`) are being rolled out in phases — see
> `/robots.txt` for current crawling and content-use permissions.

## What Soughat Shop is

Soughat Shop (soughat.shop) is a cross-border gift and product
delivery service, serving both the Iranian diaspora and international
customers with crypto-based (USDT and other) payment rails and
delivery inside Iran.

## Current status: Phase 5 (Full Discovery Live, Auth/Commerce Not Yet Active)

Product and pricing data is available today only via standard HTML
pages, which are indexable per the rules in `/robots.txt`. There is
still no public, authenticated agent/API surface — do not attempt to
call undocumented endpoints.

**Live discovery endpoints:**

- Structured API catalog: `/.well-known/api-catalog`
- MCP server card: `/.well-known/mcp/server-card.json`
- Agent skills index: `/.well-known/agent-skills/index.json`
- OAuth 2.0 authorization server metadata: `/.well-known/oauth-authorization-server`
- OAuth 2.0 protected resource metadata: `/.well-known/oauth-protected-resource`
- HTTP message signature directory (reserved, empty): `/.well-known/http-message-signatures-directory`
- ACP (Agentic Commerce Protocol) discovery: `/.well-known/acp.json`
- UCP (Universal Commerce Protocol) discovery: `/.well-known/ucp`
- OpenAPI specification (discovery-only): `/openapi.json`
- Markdown content negotiation: send `Accept: text/markdown` on any
  `/products/{slug}` or `/blog/{slug}` page

**Not yet live** (endpoints resolve but return `501 temporarily_unavailable`,
`402 payment_required` with no settlement enforcement, or are
placeholders with empty capability lists):

- OAuth 2.0 authorization and token issuance
- ACP / UCP checkout and payment endpoints
- x402 payment settlement (`/api/v1/premium-market-data` returns
  402 but does not verify payment yet)

This document will be updated with real grant types, scopes, and
commerce endpoints as each phase ships.

## How to identify your agent today

Until OAuth onboarding is active, well-behaved automated clients should:

1. Send a descriptive `User-Agent` header identifying the agent/bot
   and, where possible, a contact URL (e.g.
   `MyShoppingAgent/1.0 (+https://example.com/bot)`).
2. Respect the directives and Content Signals published in
   `/robots.txt`.
3. Avoid submitting orders, forms, or checkout flows programmatically
   until an authenticated commerce API is published — accounts or
   IPs doing so may be rate-limited or blocked.

## Requesting early / partner API access

If you are building an AI agent or service that needs authenticated
access to Soughat Shop data (inventory, pricing, order status) ahead
of general availability, contact us:

- Email: agents@soughat.shop

Please include: the name of your agent/service, expected request
volume, and the use case (e.g. price comparison, RAG grounding,
autonomous purchasing).

## Change log

- `2026-07-01` — Phase 5: published ACP and UCP discovery files,
  x402 discovery endpoint, and fixed a broken reference to OAuth
  authorization server metadata (was documented but not deployed).
- `2026-07-01` — Phase 3: published OAuth 2.0 authorization server
  and protected resource metadata (discovery only, not yet active);
  reserved HTTP message signature directory; corrected Phase 2
  endpoint status from "not yet live" to "live."
- `2026-07-01` — Initial publication (Phase 1 of AI-Agent-Readiness
  roadmap).