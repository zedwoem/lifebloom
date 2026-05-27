"use client";

import { useEffect, useState } from "react";
import { getWebsiteSettings, updateWebsiteSetting } from "@/lib/actions/settingsActions";
import { useRouter, useParams } from "next/navigation";
import { Globe, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { HydrationGuard } from "@/components/ui/hydration-guard";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || "en";
  const supabase = createClient();

  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminAndLoadSettings() {
      const { data: adminCheck } = await supabase.rpc("is_admin");
      const isUserAdmin = adminCheck === true;
      
      if (!isUserAdmin) {
        setIsAdmin(false);
        toast.error("Akses Ditolak. Anda bukan Administrator.");
        router.push(`/dashboard`);
        return;
      }
      
      setIsAdmin(true);
      try {
        const data = await getWebsiteSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
      setLoading(false);
    }
    
    if (profile !== undefined) {
      checkAdminAndLoadSettings();
    }
  }, [profile, router, supabase, locale]);

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    toast.loading(`Menyimpan ${key}...`);
    
    const res = await updateWebsiteSetting(key, value);
    
    toast.dismiss();
    if (res.success) {
      toast.success("Pengaturan berhasil disimpan.");
    } else {
      toast.error(res.error || "Gagal menyimpan pengaturan.");
    }
    setSavingKey(null);
  };

  const handleValueChange = (key: string, newValue: string) => {
    setSettings((prev) => 
      prev.map((s) => s.key === key ? { ...s, value: newValue } : s)
    );
  };

  if (isAdmin === null || loading) {
    return <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]"></div></div>;
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <HydrationGuard fallbackHeight="h-screen">
      <div className="bg-[#FFFDF5] text-slate-900 min-h-screen p-6 md:p-12 font-sans selection:bg-[#85f8c4] selection:text-[#002114]">
        
        <header className="max-w-[1120px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin`}>
              <button className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-500" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                PENGATURAN GLOBAL
              </h1>
              <p className="text-slate-500 mt-1 text-lg">Konfigurasi Variabel Website (Tanpa Restart Server)</p>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto space-y-6">
          {settings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
              <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-700">Tidak ada pengaturan</h3>
              <p className="text-slate-500 mt-2">Tabel website_settings kosong.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.key} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {setting.key.replace(/_/g, ' ')}
                    </label>
                    <p className="text-slate-500 text-sm mb-4">{setting.description}</p>
                    
                    {setting.key === 'maintenance_mode' ? (
                      <select 
                        value={setting.value}
                        onChange={(e) => handleValueChange(setting.key, e.target.value)}
                        className="w-full min-h-[52px] px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] outline-none font-bold"
                      >
                        <option value="false">Tidak Aktif (Live)</option>
                        <option value="true">Aktif (Sedang Perbaikan)</option>
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        value={setting.value}
                        onChange={(e) => handleValueChange(setting.key, e.target.value)}
                        className="w-full min-h-[52px] px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#006948]/20 focus:border-[#006948] outline-none font-bold"
                      />
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleUpdate(setting.key, setting.value)}
                    disabled={savingKey === setting.key}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#006948] hover:bg-[#00855d] text-white rounded-xl font-bold min-h-[52px] w-full md:w-auto transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" /> Simpan
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </HydrationGuard>
  );
}
