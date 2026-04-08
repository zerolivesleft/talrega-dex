import { NextRequest, NextResponse } from "next/server";
import { searchPokemon } from "@/lib/pokemon";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const typesParam = searchParams.get("types");
  const types = typesParam ? typesParam.split(",").filter(Boolean) : [];

  const results = await searchPokemon(q, types);
  return NextResponse.json(results);
}
