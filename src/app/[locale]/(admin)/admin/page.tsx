"use client";

import { AdminAnalyticsDashboard } from '@/components/admin/admin-analytics-dashboard';
import { SponsorApprovalSection } from '@/components/admin/sponsor-approval-section';

export default function AdminPage() {
  // Authentication and role checks are now handled strictly by (admin)/layout.tsx
  // This page only concerns itself with rendering admin content
  return (
    <div className="p-6 md:p-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Platform Overview</h1>
        <p className="text-slate-500">Monitor platform metrics and manage expert approvals.</p>
      </div>
      
      <AdminAnalyticsDashboard />
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <SponsorApprovalSection />
      </div>
    </div>
  );
}
