import { MiddlewareRequest, NextRequest } from "@netlify/next";
import { NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(nextRequest: NextRequest) {
  try {
    const req = new MiddlewareRequest(nextRequest);

    if (
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.includes("/api/") ||
      PUBLIC_FILE.test(req.nextUrl.pathname)
    ) {
      return;
    }

    if (req.nextUrl.locale === "default") {
      const locale = req.cookies.get("NEXT_LOCALE")?.value || "en";

      return NextResponse.redirect(
        new URL(
          `/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`,
          req.url
        )
      );
    }
  } catch (error) {
    console.log(error);
  }
}
