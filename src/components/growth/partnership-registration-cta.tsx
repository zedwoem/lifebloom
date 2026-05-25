"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, Building2, UserCircle2 } from "lucide-react";

export function PartnershipRegistrationCTA() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue to-slate-900 p-8 md:p-12 shadow-2xl border border-white/10 group">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-green/30 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:bg-brand-green/40 transition-colors duration-700"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-brand-blue/40 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Content Section */}
        <div className="max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <BadgeCheck className="w-4 h-4 text-brand-green" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">E-E-A-T Partnership Program</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            Tingkatkan Otoritas Anda. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-teal-300">
              Jangkau Jutaan Lansia & Keluarga.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl">
            LifeBloom Hub membuka pintu kemitraan resmi untuk Pakar Medis, Penasihat Finansial, Organisasi Nirlaba, hingga *Brand* Inklusif. Daftarkan profil entitas Anda untuk diverifikasi oleh sistem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="min-h-[56px] px-8 text-lg bg-brand-green hover:bg-brand-green-dark text-white shadow-lg shadow-brand-green/20 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105">
              <UserCircle2 className="w-5 h-5 mr-2" />
              Daftar sebagai Pakar
            </Button>
            <Button variant="outline" className="min-h-[56px] px-8 text-lg bg-white/5 hover:bg-white/10 text-white border-white/20 backdrop-blur-sm rounded-xl font-bold flex items-center justify-center transition-all">
              <Building2 className="w-5 h-5 mr-2" />
              Registrasi Institusi/Brand
            </Button>
          </div>
        </div>

        {/* Floating Cards (Visual) */}
        <div className="hidden lg:flex relative w-72 h-72 items-center justify-center">
          <div className="absolute z-20 w-full p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-xl">S</div>
              <div>
                <p className="font-bold text-white leading-tight">Dr. Sarah Chen, MD</p>
                <p className="text-xs text-slate-300">Verified Medical Reviewer</p>
              </div>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mb-2"></div>
            <div className="w-2/3 bg-white/20 h-2 rounded-full"></div>
          </div>

          <div className="absolute z-10 w-full p-4 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-xl transform -rotate-6 translate-y-12 -translate-x-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold"><Building2 className="w-6 h-6"/></div>
              <div>
                <p className="font-bold text-white leading-tight">Global Care Inc.</p>
                <p className="text-xs text-slate-400">Institutional Sponsor</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
