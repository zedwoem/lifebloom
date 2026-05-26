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
      // Determine Role for Redirect
      const { data: profileData } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();
      const profile = profileData as { role: string | null } | null;
        
      let redirectPath = `/${locale}/saved`; // Default for standard users
      
      if (profile?.role === 'admin') {
        redirectPath = `/${locale}/admin`;
      } else if (profile?.role === 'expert') {
        redirectPath = `/${locale}/dashboard`;
      }
      
      return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
    } else {
      console.error("Auth callback error:", error)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${requestUrl.origin}/${locale}/login?error=auth-callback-failed`)
}
