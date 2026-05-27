import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const localeMatch = requestUrl.pathname.match(/^\/([^\/]+)\/callback/);
  const locale = localeMatch ? localeMatch[1] : 'en';

  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && authData?.user) {
      // Elevate admin if email matches
      if (authData.user.email === 'liorazedwoem@gmail.com') {
        const { error: rpcErr } = await supabase.rpc('elevate_to_admin', { email_param: authData.user.email });
        if (rpcErr) console.error("Admin elevation error:", rpcErr);
      }

      // Determine Role for Redirect
      const { data: profile } = (await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single()) as any;
        
        
      let redirectPath = `/saved`; // Default for standard users
      
      if (profile?.role === 'admin') {
        redirectPath = `/admin`;
      } else if (profile?.role === 'expert') {
        redirectPath = `/dashboard`;
      }
      
      return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
    } else {
      console.error("Auth callback error:", error)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-callback-failed`)
}
