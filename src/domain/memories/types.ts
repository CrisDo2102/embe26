import type { MEMORY_CATEGORY_VALUES } from "@/lib/constants";

export type MemoryCategoryValue = (typeof MEMORY_CATEGORY_VALUES)[number];
export type MemoryCategory = "all" | MemoryCategoryValue;

export type MemoryRecord = {
  id: string;
  date: string;
  title: string;
  description: string;
  category: MemoryCategoryValue;
  tags: readonly string[];
};

export type MemoryFilter = { query: string; category: MemoryCategory };
export type CategoryCount = { category: MemoryCategoryValue; count: number };
