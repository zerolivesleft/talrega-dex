import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/globalSearch";

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const data = await globalSearch(q);
  return NextResponse.json(data);
}
