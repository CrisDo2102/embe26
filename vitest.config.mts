import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/domain/**", "src/lib/**", "src/app/api/**"],
      exclude: ["**/*.test.*", "**/types.ts"],
      // Ratchet: coverage is ~99% today; fail the build if it slips meaningfully.
      thresholds: { statements: 95, branches: 85, functions: 95, lines: 95 },
    },
  },
});
