import { QUIET_MODE_STORAGE_KEY } from "@/lib/constants";
import { createBooleanPreference } from "./preference-store";

export const quietModePreference = createBooleanPreference(() => window.localStorage, QUIET_MODE_STORAGE_KEY);
