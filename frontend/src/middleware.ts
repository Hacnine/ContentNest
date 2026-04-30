import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth is handled client-side in admin/layout.tsx.
  // This middleware exists as an extension point for future server-side checks.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
