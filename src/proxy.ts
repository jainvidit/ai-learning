import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Local-only app: reject anything not addressed to localhost.
export default function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0];
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    return new NextResponse("This app only serves localhost.", { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
