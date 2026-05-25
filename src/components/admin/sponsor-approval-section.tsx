"use client";

import React, { useEffect, useState } from "react";
import { getPendingSponsors } from "@/lib/actions/adminActions";
import { SponsorApprovalTable } from "@/components/admin/sponsor-approval-table";
import { ShieldCheck } from "lucide-react";

export function SponsorApprovalSection() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getPendingSponsors();
      setSponsors(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-slate-100 h-64 rounded-xl w-full"></div>;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-6 h-6 text-brand-green" />
        <h2 className="text-2xl font-black text-slate-800">Partnership Approvals</h2>
      </div>
      <SponsorApprovalTable initialSponsors={sponsors} />
    </div>
  );
}
