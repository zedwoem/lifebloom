import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const localeMatch = requestUrl.pathname.match(/^\/([^\/]+)\/callback/);
  const locale = localeMatch ? localeMatch[1] : 'en';

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}/${locale}/dashboard`)
    } else {
      console.error("Auth callback error:", error)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${requestUrl.origin}/${locale}/login?error=auth-callback-failed`)
}
