import { memoryService } from "@/domain/memories/service";
import { errorResponse, jsonCached } from "@/lib/api/respond";
import { isValidCategory, validateSearchQuery } from "@/lib/utils/validation";

const CACHE_CONTROL = "public, max-age=30, stale-while-revalidate=60";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = validateSearchQuery(params.get("q"));
  const requested = params.get("category");
  // Unknown categories fall back to "all" rather than failing: a stale bookmark should still work.
  const category = isValidCategory(requested) ? requested : "all";

  try {
    const items = await memoryService.list({ query, category });
    return jsonCached(request, { data: items, meta: { count: items.length, query, category } }, CACHE_CONTROL);
  } catch (error) {
    return errorResponse(error, "memories");
  }
}
