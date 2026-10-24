import { DomainError } from "./errors";
import { localMemoryRepository, type MemoryRepository } from "./repository";
import type { CategoryCount, MemoryFilter, MemoryRecord } from "./types";
import { MEMORY_CATEGORY_VALUES } from "@/lib/constants";
import { foldForSearch, normalizeForCompare } from "@/lib/utils/text";
import { validateId } from "@/lib/utils/validation";

export class MemoryService {
  constructor(private readonly repository: MemoryRepository = localMemoryRepository) {}

  /**
   * Filters by category and by free text. Every word of the query must match (order-independent),
   * accents are optional, and records that match with their exact accents rank first.
   */
  async list(filter: MemoryFilter = { query: "", category: "all" }): Promise<MemoryRecord[]> {
    const records = await this.repository.list();
    const exactTokens = tokenize(normalizeForCompare(filter.query));
    const foldedTokens = tokenize(foldForSearch(filter.query));

    const ranked = records.flatMap((record, order) => {
      if (filter.category !== "all" && record.category !== filter.category) return [];
      if (foldedTokens.length === 0) return [{ record, score: 0, order }];
      const haystack = [record.title, record.description, ...record.tags].join(" ");
      if (includesAll(normalizeForCompare(haystack), exactTokens)) return [{ record, score: 2, order }];
      if (includesAll(foldForSearch(haystack), foldedTokens)) return [{ record, score: 1, order }];
      return [];
    });
    return ranked.sort((a, b) => b.score - a.score || a.order - b.order).map((entry) => entry.record);
  }

  async get(id: string): Promise<MemoryRecord> {
    const valid = validateId(id);
    if (!valid) throw new DomainError("INVALID_INPUT", "Mã kỷ niệm không hợp lệ.");
    const record = await this.repository.findById(valid);
    if (!record) throw new DomainError("NOT_FOUND", "Không tìm thấy kỷ niệm này.");
    return record;
  }

  /** Categories that actually contain records, so the UI never offers an empty filter. */
  async categories(): Promise<CategoryCount[]> {
    const records = await this.repository.list();
    return MEMORY_CATEGORY_VALUES.map((category) => ({
      category,
      count: records.filter((record) => record.category === category).length,
    })).filter((entry) => entry.count > 0);
  }
}

function tokenize(value: string): string[] {
  return value ? value.split(" ") : [];
}
function includesAll(haystack: string, tokens: string[]): boolean {
  return tokens.every((token) => haystack.includes(token));
}

export const memoryService = new MemoryService();
