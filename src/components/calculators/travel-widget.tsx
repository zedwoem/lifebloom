"use client";

import React from 'react';
import Script from 'next/script';
import { ClientOnly } from '@/components/ui/client-only';
import { Plane, Compass } from 'lucide-react';

export function TravelpayoutsWidget() {
  return (
    <ClientOnly fallbackHeight="h-[400px]">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden mb-8">
        
        {/* Travelpayouts Script Loader */}
        <Script 
          src="https://tpwgt.com/wl_web/main.js?wl_id=17945"
          strategy="lazyOnload"
          onLoad={() => {
            console.log("[Travelpayouts] White Label widget script loaded successfully.");
          }}
        />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-sky-50 rounded-xl text-sky-600 border border-sky-100">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
              Universal Flight & Hotel Search
            </h2>
            <p className="text-slate-500 text-sm">
              Search the lowest wheelchair-accessible fares and barrier-free stays globally.
            </p>
          </div>
        </div>

        {/* Travelpayouts Metasearch Forms */}
        <div className="space-y-8">
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 min-h-[150px]">
            <div id="tpwl-search" className="w-full min-h-[100px] flex items-center justify-center">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mx-auto mb-2"></div>
                <p className="text-xs text-slate-400 font-medium">Initializing Metasearch Engine...</p>
              </div>
            </div>
          </div>

          {/* Travelpayouts Search Results container */}
          <div className="border border-slate-100 rounded-2xl p-4 bg-white min-h-[250px]">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-500" /> Best Deals Found
            </h3>
            <div id="tpwl-tickets" className="w-full">
              <p className="text-center text-xs text-slate-400 py-12">
                Your customized ticket options will populate here upon search.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </ClientOnly>
  );
}
export default TravelpayoutsWidget;
