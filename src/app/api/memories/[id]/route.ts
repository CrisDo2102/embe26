import { memoryService } from "@/domain/memories/service";
import { errorResponse, jsonCached } from "@/lib/api/respond";

const CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return jsonCached(request, { data: await memoryService.get(id) }, CACHE_CONTROL);
  } catch (error) {
    return errorResponse(error, "memories/id");
  }
}
