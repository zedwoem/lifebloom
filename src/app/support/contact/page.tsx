"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { submitContactAction } from '@/lib/actions/communityActions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, User, Building, MessageSquare, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const ref = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    category: 'general' as 'general' | 'expert_join' | 'sponsor_inquiry',
    message: '',
  });

  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; error?: string } | null>(null);

  // Automatically adjust form categories based on partner/expert reference link
  useEffect(() => {
    if (ref) {
      if (ref.startsWith('partner_')) {
        const partnerId = ref.replace('partner_', '');
        setFormData(prev => ({
          ...prev,
          category: 'sponsor_inquiry',
          message: prev.message || `Halo, kami tertarik untuk berdiskusi mengenai kemitraan atau penawaran sponsor terkait ID Mitra: ${partnerId}.`
        }));
      } else if (ref.startsWith('expert_')) {
        const expertSlug = ref.replace('expert_', '');
        setFormData(prev => ({
          ...prev,
          category: 'expert_join',
          message: prev.message || `Halo, saya adalah seorang pakar klinis terverifikasi (ID: ${expertSlug}) yang ingin bergabung atau berkontribusi dalam pembuatan artikel edukatif.`
        }));
      }
    }
  }, [ref]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setStatus(null);

    try {
      const res = await submitContactAction(formData);
      if (res.success) {
        setStatus({ success: true });
        setFormData({
          name: '',
          email: '',
          companyName: '',
          category: 'general',
          message: '',
        });
      } else {
        setStatus({ error: res.error || 'Terjadi kesalahan saat mengirim formulir.' });
      }
    } catch (err: any) {
      setStatus({ error: err.message || 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      
      {/* Return link */}
      <Link 
        href={`/${locale}/support`}
        className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-dark mb-8 transition-all font-bold min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Help Desk
      </Link>

      <Card className="border border-slate-200 shadow-soft-ambient rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-slate-800" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
                Hubungi Kami
              </CardTitle>
              <CardDescription className="text-slate-500">
                Punya pertanyaan, tawaran kemitraan, atau ingin berkontribusi? Kirimkan pesan Anda di bawah ini.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="p-8">
          {status?.success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl flex items-start gap-4 mb-6">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">Pesan Berhasil Dikirim!</h4>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  Terima kasih atas pesan Anda. Tim dukungan atau verifikasi kami akan segera menghubungi Anda melalui email dalam waktu 24 jam.
                </p>
              </div>
            </div>
          ) : null}

          {status?.error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl flex items-start gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">Pengiriman Gagal</h4>
                <p className="text-sm text-rose-700">{status.error}</p>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> Nama Lengkap
              </label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-[52px] rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" /> Alamat Email
              </label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="nama@perusahaan.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-[52px] rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-company" className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" /> Nama Instansi / Perusahaan <span className="text-xs text-slate-400 font-normal">(Opsional)</span>
              </label>
              <Input
                id="contact-company"
                name="companyName"
                type="text"
                placeholder="Contoh: PT Medika Utama..."
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="h-[52px] rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-category" className="text-sm font-bold text-slate-700">Kategori Pesan</label>
              <select
                id="contact-category"
                name="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full h-[52px] px-4 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
              >
                <option value="general">Tanya Jawab Umum</option>
                <option value="expert_join">Pendaftaran Kontributor / Pakar</option>
                <option value="sponsor_inquiry">Kemitraan & Penawaran Sponsor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" /> Isi Pesan
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                placeholder="Tulis pesan lengkap Anda di sini..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full p-4 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green placeholder:text-slate-400"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-[52px] bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl text-base shadow-md transition-colors"
            >
              {isPending ? 'Sedang mengirim...' : 'Kirim Pesan Sekarang'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 font-bold text-lg">Memuat formulir kontak...</div>}>
      <ContactFormContent />
    </Suspense>
  );
}
