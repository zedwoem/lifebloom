"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShieldCheck, LifeBuoy, FileText } from "lucide-react";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = "en";

  // Note: if localePrefix is 'as-needed', the default locale ('en') might not appear in pathname.
  // Using next-intl Link is usually safer, but since we use next/link with manual prefixes, 
  // we must ensure the locale is correctly prepended only if we want explicit paths, or just let next-intl's Link handle it.
  // Actually, since we're using localePrefix: 'as-needed', it's better to just use relative or next-intl Link.
  // We'll stick to manual for now, but locale is guaranteed correct now.
  const localePath = locale === 'en' ? '' : ``;

  const MENU = [
    { name: "Help Desk", href: `${localePath}/support`, icon: <LifeBuoy className="w-5 h-5" /> },
    { name: "Terms of Service", href: `${localePath}/support/terms`, icon: <FileText className="w-5 h-5" /> },
    { name: "Privacy Policy", href: `${localePath}/support/privacy`, icon: <ShieldCheck className="w-5 h-5" /> },
    { name: "Knowledge Base", href: `${localePath}/support/knowledge`, icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* SIDEBAR */}
        <aside className="md:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-brand-blue mb-6">Support & Legal</h2>
            <nav className="flex flex-col gap-2">
              {MENU.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                      isActive 
                        ? 'bg-brand-green/10 text-brand-green-dark border border-brand-green/20' 
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="md:col-span-3 min-w-0">
          <div className="bg-white rounded-3xl p-6 md:p-12 border border-slate-200 shadow-sm min-h-[600px] overflow-hidden break-words">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
