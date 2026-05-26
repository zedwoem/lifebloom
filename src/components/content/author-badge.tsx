import React from 'react';
import { ShieldCheck, User, Star, Award, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AuthorType = 'user' | 'expert' | 'partner' | 'sponsor' | 'admin';

interface AuthorBadgeProps {
  type: AuthorType;
  name: string;
  className?: string;
}

const badgeConfig: Record<AuthorType, { icon: React.ElementType, bg: string, text: string, label: string }> = {
  user: { icon: User, bg: 'bg-slate-100', text: 'text-slate-600', label: 'Community Member' },
  expert: { icon: Star, bg: 'bg-amber-100', text: 'text-amber-700', label: 'Verified Expert' },
  partner: { icon: Award, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Official Partner' },
  sponsor: { icon: Building2, bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Brand Sponsor' },
  admin: { icon: ShieldCheck, bg: 'bg-rose-100', text: 'text-rose-700', label: 'LifeBloom Staff' },
};

export function AuthorBadge({ type, name, className }: AuthorBadgeProps) {
  const config = badgeConfig[type] || badgeConfig.user;
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="font-bold text-slate-800" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
        {name}
      </span>
      <div 
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
          config.bg,
          config.text
        )}
        title={config.label}
        aria-label={config.label}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{type}</span>
      </div>
    </div>
  );
}
