import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = `# ==================================================================
# Content Signals Policy — https://contentsignals.org
# As a condition of accessing this website, you agree to abide by
# the following content signals:
# (a) If a content-signal value is "yes", you may collect content
#     for the corresponding use.
# (b) If a content-signal value is "no", you may NOT collect content
#     for the corresponding use.
# (c) If a content signal is omitted, the operator neither grants
#     nor restricts permission via content signal for that use.
#
# The content signals and their meanings are:
#   search    - building a search index and providing search results
#               (e.g. hyperlinks and short excerpts). Does not include
#               AI-generated search summaries.
#   ai-input  - inputting content into AI models in real time
#               (e.g. RAG, grounding, live generative AI answers).
#   ai-train  - training or fine-tuning AI models.
#
# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS
# RESERVATIONS OF RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN UNION
# DIRECTIVE 2019/790 ON COPYRIGHT AND RELATED RIGHTS IN THE
# DIGITAL SINGLE MARKET.
# ==================================================================

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /success/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}