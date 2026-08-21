import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0];

  // Allow localhost, Vercel domains, and production hosts
  const isAllowed =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.includes("vercel.app") ||
    hostname.includes("ai-learning");

  if (!isAllowed) {
    return new NextResponse("Access denied.", { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
