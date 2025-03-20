import { parse } from "cookie";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { pathToRegexp } from "path-to-regexp";

const publicRoutes = ["/login", "/signup"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const cookie = (await cookies()).get("session")?.value;

  const session = cookie ? parse(cookie)["session"] : null;

  const sessionData = session
    ? JSON.parse(Buffer.from(session, "hex").toString())
    : null;

  const canAccessPath = (path: string) => {
    if (!!sessionData?.user) {
      return true;
    }

    return publicRoutes.some((route) => {
      const regex = pathToRegexp(route);
      return regex.regexp.test(path);
    });
  };

  if (canAccessPath(path)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", req.nextUrl));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
