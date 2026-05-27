"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShieldCheck, LifeBuoy, FileText, Info, Mail } from "lucide-react";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const MENU = [
    { name: "About LifeBloom", href: "/about", icon: <Info className="w-5 h-5" /> },
    { name: "Help Desk", href: "/support", icon: <LifeBuoy className="w-5 h-5" /> },
    { name: "Contact Support", href: "/support/contact", icon: <Mail className="w-5 h-5" /> },
    { name: "Terms of Service", href: "/support/terms", icon: <FileText className="w-5 h-5" /> },
    { name: "Privacy Policy", href: "/support/privacy", icon: <ShieldCheck className="w-5 h-5" /> },
    { name: "Knowledge Base", href: "/support/knowledge", icon: <BookOpen className="w-5 h-5" /> },
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
