import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every request and enforces
 * route-level access rules:
 *  - /personal/**  -> requires role = 'personal'
 *  - /aluno/**     -> requires role = 'aluno'
 *  - unauthenticated users hitting protected routes -> redirected to /login
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = path.startsWith('/personal') || path.startsWith('/aluno');

  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (path.startsWith('/personal') || path.startsWith('/aluno'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'personal' && path.startsWith('/aluno')) {
      return NextResponse.redirect(new URL('/personal/dashboard', request.url));
    }
    if (profile?.role === 'aluno' && path.startsWith('/personal')) {
      return NextResponse.redirect(new URL('/aluno/dashboard', request.url));
    }
  }

  return response;
}
