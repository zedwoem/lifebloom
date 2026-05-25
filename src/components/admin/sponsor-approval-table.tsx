"use client";

import React, { useState } from "react";
import { approveSponsor, rejectSponsor } from "@/lib/actions/adminActions";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldAlert } from "lucide-react";

export function SponsorApprovalTable({ initialSponsors }: { initialSponsors: any[] }) {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await approveSponsor(id);
    if (res.success) {
      setSponsors(sponsors.filter(s => s.id !== id));
    } else {
      alert("Failed to approve");
    }
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    const res = await rejectSponsor(id);
    if (res.success) {
      setSponsors(sponsors.filter(s => s.id !== id));
    } else {
      alert("Failed to reject");
    }
    setLoadingId(null);
  };

  if (sponsors.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No Pending Approvals</h3>
        <p className="text-slate-500">All expert and sponsor profiles are up to date.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 font-bold text-sm text-slate-600">Entity Name</th>
            <th className="p-4 font-bold text-sm text-slate-600">Type</th>
            <th className="p-4 font-bold text-sm text-slate-600">Specialty</th>
            <th className="p-4 font-bold text-sm text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sponsors.map(sponsor => (
            <tr key={sponsor.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="p-4">
                <div className="font-bold text-slate-800">{sponsor.display_name}</div>
                <div className="text-xs text-slate-500">{sponsor.title}</div>
              </td>
              <td className="p-4 uppercase text-xs font-bold text-slate-500">{sponsor.entity_type}</td>
              <td className="p-4 text-sm text-slate-600">{sponsor.pillar_specialty || "General"}</td>
              <td className="p-4 flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleApprove(sponsor.id)}
                  disabled={loadingId === sponsor.id}
                  className="bg-brand-green hover:bg-brand-green-dark text-white"
                >
                  <Check className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleReject(sponsor.id)}
                  disabled={loadingId === sponsor.id}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
