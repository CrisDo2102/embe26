export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      status: "ok",
      app: "embe",
      timestamp: new Date().toISOString(),
      // Injected from package.json at build time by next.config.ts.
      version: process.env.APP_VERSION ?? "unknown",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
