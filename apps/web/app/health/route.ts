import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    services: {
      web: {
        status: "up"
      }
    },
    timestamp: new Date().toISOString()
  });
}
