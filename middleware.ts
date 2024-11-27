import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Users } from "./server/db/schema";
import { db } from "./server/db/drizzle"; 
import { addUserIfNotExists } from "./server/mutations"

const isPublicRoute = createRouteMatcher(["/", "/sign-in", "/politicas-privacidad", "/terminos-y-condiciones" ]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!isPublicRoute(req) && !userId) {
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};