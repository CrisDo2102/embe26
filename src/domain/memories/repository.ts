import { memories } from "@/data/memories";
import type { MemoryRecord } from "./types";

/**
 * A deliberately small repository boundary. Today it adapts local content;
 * a database-backed implementation can replace it without coupling the UI
 * to a storage provider. Adapters must hand out detached copies.
 */
export interface MemoryRepository {
  list(): Promise<MemoryRecord[]>;
  findById(id: string): Promise<MemoryRecord | undefined>;
}

function detach(record: MemoryRecord): MemoryRecord {
  return { ...record, tags: [...record.tags] };
}

export const localMemoryRepository: MemoryRepository = {
  async list() {
    return memories.map(detach);
  },
  async findById(id) {
    const record = memories.find((item) => item.id === id);
    return record ? detach(record) : undefined;
  },
};
