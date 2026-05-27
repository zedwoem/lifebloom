"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Shield, Ban, Check, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { HydrationGuard } from "@/components/ui/hydration-guard";
import { listAllUsers, updateUserRole, toggleUserActiveStatus } from "@/lib/actions/userActions";

export default function AdminUsersPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || "en";
  const supabase = createClient();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminAndLoadUsers() {
      const { data: adminCheck } = await supabase.rpc("is_admin");
      const isUserAdmin = adminCheck === true;

      if (!isUserAdmin) {
        setIsAdmin(false);
        toast.error("Akses Ditolak. Anda bukan Administrator.");
        router.push(`/dashboard`);
        return;
      }

      setIsAdmin(true);
      const res = await listAllUsers();
      if (res.success && res.users) {
        setUsers(res.users);
      } else {
        toast.error(res.error || "Gagal memuat pengguna.");
      }
      setLoading(false);
    }

    if (profile !== undefined) {
      checkAdminAndLoadUsers();
    }
  }, [profile, router, supabase, locale]);

  const handleChangeRole = async (userId: string, newRole: string) => {
    toast.loading("Memperbarui peran pengguna...");
    const res = await updateUserRole({ userId, newRole });
    toast.dismiss();

    if (res.success) {
      toast.success("Peran berhasil diperbarui!");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      toast.error(res.error || "Gagal memperbarui peran.");
    }
  };

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    const nextActive = !currentActive;
    toast.loading(nextActive ? "Mengaktifkan pengguna..." : "Membekukan pengguna...");
    const res = await toggleUserActiveStatus({ userId, isActive: nextActive });
    toast.dismiss();

    if (res.success) {
      toast.success(nextActive ? "Pengguna diaktifkan kembali!" : "Pengguna berhasil dibekukan!");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: nextActive } : u))
      );
    } else {
      toast.error(res.error || "Gagal memperbarui status aktif.");
    }
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006948]"></div>
      </div>
    );
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
                USER & CRM MANAGER
              </h1>
              <p className="text-slate-500 mt-1 text-lg">Kelola Hak Akses, Peran Pengguna, dan Keanggotaan Komunitas</p>
            </div>
          </div>
        </header>

        <main className="max-w-[1120px] mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold Atkinson-font">Daftar Pengguna Aktif</h3>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-100">
                {users.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Nama / Email</th>
                    <th className="px-6 py-4">Peran Saat Ini</th>
                    <th className="px-6 py-4">Status Akun</th>
                    <th className="px-6 py-4">Bergabung</th>
                    <th className="px-6 py-4 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-base">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#faf8ff]/50 transition-colors">
                      <td className="px-6 py-5">
                        <div>
                          <strong className="text-slate-800 block">{u.display_name || "Sahabat Lifebloom"}</strong>
                          <span className="text-sm text-slate-400">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          u.role === "admin" 
                            ? "bg-rose-50 text-rose-700 border-rose-100" 
                            : u.role === "expert" 
                            ? "bg-amber-50 text-amber-700 border-amber-100" 
                            : "bg-emerald-50 text-emerald-800 border-emerald-100"
                        }`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          u.is_active !== false 
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active !== false ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {u.is_active !== false ? "Aktif" : "Beku (Banned)"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-right space-x-2">
                        {/* Role Switch Buttons */}
                        {u.role !== "admin" ? (
                          <button 
                            onClick={() => handleChangeRole(u.id, "expert")}
                            className="px-3.5 py-2 text-xs font-bold bg-[#faf8ff] text-slate-700 hover:bg-[#eef0ff] hover:text-indigo-600 rounded-lg border border-slate-200 transition-all min-h-[38px]"
                          >
                            Jadikan Expert
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleChangeRole(u.id, "user")}
                            className="px-3.5 py-2 text-xs font-bold bg-[#faf8ff] text-slate-700 hover:bg-[#eef0ff] hover:text-indigo-600 rounded-lg border border-slate-200 transition-all min-h-[38px]"
                          >
                            Jadikan User biasa
                          </button>
                        )}
                        
                        {/* Ban / Unban Toggle */}
                        <button 
                          onClick={() => handleToggleStatus(u.id, u.is_active !== false)}
                          className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all min-h-[38px] ${
                            u.is_active !== false 
                              ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" 
                              : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {u.is_active !== false ? "Bekukan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </HydrationGuard>
  );
}
