"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { mockLogin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleLogin = () => {
    mockLogin("user");
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 text-center">
        <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserCircle2 className="w-8 h-8 text-brand-blue" />
        </div>
        <h1 className="text-3xl font-black text-brand-blue mb-2">Welcome Back</h1>
        <p className="text-slate-500 mb-8">Sign in to access your personalized LifeBloom Dashboard.</p>
        
        <Button onClick={handleLogin} className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold py-6 text-lg rounded-2xl">
          Continue as Member
        </Button>
      </div>
    </div>
  );
}
