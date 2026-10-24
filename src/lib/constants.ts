export const APP_NAME = "little things, us.";

/** Calendar days are counted in this zone so every viewer sees the same number. */
export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";

export const KEEPSAKE_STORAGE_KEY = "embe-keepsakes-v1";
export const QUIET_MODE_STORAGE_KEY = "embe-quiet-mode-v1";

/** Single source of truth for every limit. UI, domain, import and API all read these. */
export const MAX_KEEPSAKE_ITEMS = 30;
export const MAX_KEEPSAKE_LENGTH = 180;
export const MAX_SEARCH_LENGTH = 120;
/** Upper bound for an imported backup; real backups are a few KB. */
export const MAX_IMPORT_BYTES = 256 * 1024;

export const ROUTES = {
  home: "/",
  health: "/api/health",
  memories: "/api/memories",
} as const;

export const MEMORY_CATEGORY_VALUES = ["dates", "everyday", "trips"] as const;
export const MEMORY_CATEGORY_LABELS = {
  all: "Tất cả",
  dates: "Những buổi hẹn",
  everyday: "Ngày thường",
  trips: "Những chuyến đi",
} as const;
