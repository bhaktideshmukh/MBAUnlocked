import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth'; // Quick bypass, but jose works in edge!

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect routes starting with /colleges/[id] and /add-experience
  const isProtectedRoute = (path.startsWith('/colleges/') && path !== '/colleges') || path.startsWith('/add-experience');

  if (isProtectedRoute) {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.redirect(new URL('/auth?callbackUrl=' + encodeURIComponent(path), request.url));
    }

    try {
      // jose runs happily in the edge runtime!
      const secretKey = process.env.JWT_SECRET || 'super-secret-mba-key-for-mvp-only';
      const encodedKey = new TextEncoder().encode(secretKey);
      const { jwtVerify } = await import('jose');
      await jwtVerify(session, encodedKey);
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/auth?callbackUrl=' + encodeURIComponent(path), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/colleges/:path*', '/add-experience/:path*'],
};
