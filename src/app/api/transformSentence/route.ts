export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

import { anonymizeUser } from "@/lib/anonymizeUser";
import { authOptions } from "@/lib/auth";
import { proxyUpstream } from "@/lib/proxyUpstream";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = await getToken({ req, raw: true });

  if (!session || !session.user?.name) {
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

  const body = {
    ...data,
    environment: process.env.ENVIRONMENT || "production",
    username: anonymizeUser(session),
    model: process.env.NLP_MODEL || "t5",
  };

  console.log(body);

  return proxyUpstream({
    route: "/api/transformSentence",
    url: `${process.env.NLP_API}/transform-sentence-to-imr`,
    token,
    body,
    session,
    prompt: data?.sentence,
  });
}
