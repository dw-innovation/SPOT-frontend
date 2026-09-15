export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

import { authOptions } from "@/lib/auth";
import { proxyUpstream } from "@/lib/proxyUpstream";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = await getToken({ req, raw: true });

  if (!session) {
    return NextResponse.json(
      {
        status: "error",
        message: "unauthenticated",
      },
      {
        status: 401,
      }
    );
  }

  const data = await req.json();

  return proxyUpstream({
    route: "/api/queryOSM",
    url: `${process.env.OSM_API}/run-spot-query`,
    token,
    body: data,
    session,
    spotQuery: data,
  });
}
