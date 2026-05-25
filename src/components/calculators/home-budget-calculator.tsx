"use client";

import React, { useState } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 14, color: '#444' },
  value: { fontSize: 14, fontWeight: 'bold' },
  totalBox: { marginTop: 30, paddingTop: 20, borderTop: '1px solid #ccc', flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' }
});

const BudgetPDF = ({ area, costPerSqm, contingency, total }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Rencana Anggaran Renovasi Rumah</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Luas Area (m2)</Text>
        <Text style={styles.value}>{area}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Biaya per m2</Text>
        <Text style={styles.value}>Rp {costPerSqm.toLocaleString('id-ID')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal Material & Jasa</Text>
        <Text style={styles.value}>Rp {(area * costPerSqm).toLocaleString('id-ID')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Buffer Kontinjensi (15%)</Text>
        <Text style={styles.value}>Rp {contingency.toLocaleString('id-ID')}</Text>
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total Estimasi Anggaran</Text>
        <Text style={styles.totalValue}>Rp {total.toLocaleString('id-ID')}</Text>
      </View>
      
      <View style={{ marginTop: 50, padding: 20, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
          Dokumen ini di-generate oleh LifeBloom Hub. 
          Scan QR Code di rumah cerdas Anda untuk menyimpan sesi keluarga.
        </Text>
      </View>
    </Page>
  </Document>
);

export function HomeBudgetCalculator() {
  const [area, setArea] = useState<number | "">("");
  const [costPerSqm, setCostPerSqm] = useState<number | "">(3500000);
  const [isGenerating, setIsGenerating] = useState(false);

  const subtotal = (Number(area) || 0) * (Number(costPerSqm) || 0);
  const contingency = subtotal * 0.15;
  const total = subtotal + contingency;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<BudgetPDF area={area} costPerSqm={costPerSqm} contingency={contingency} total={total} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Rencana_Renovasi_LifeBloom.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ClientOnly fallbackHeight="h-[600px]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Kalkulator Anggaran Renovasi</h2>
        <p className="text-lg text-slate-600 mb-6">
          Hitung estimasi biaya perombakan atau renovasi hunian Anda secara presisi dengan keamanan penyangga dana tak terduga (kontinjensi 15%).
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-slate-700 mb-2">Luas Area (m&sup2;)</label>
            <Input 
              type="number"
              placeholder="Misal: 45" 
              value={area}
              onChange={(e) => setArea(e.target.value === "" ? "" : Number(e.target.value))}
              className="text-lg min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-slate-700 mb-2">Indeks Biaya per m&sup2; (Rp)</label>
            <Input 
              type="number"
              value={costPerSqm}
              onChange={(e) => setCostPerSqm(e.target.value === "" ? "" : Number(e.target.value))}
              className="text-lg min-h-[48px]"
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
            <div className="flex justify-between mb-2">
              <span className="text-lg text-slate-600">Subtotal</span>
              <span className="text-lg font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-lg text-slate-600">Buffer Kontinjensi (15%)</span>
              <span className="text-lg font-bold text-slate-800">Rp {contingency.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xl font-bold text-slate-800">Total Estimasi</span>
              <span className="text-3xl font-black text-brand-green">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <Button 
            onClick={handleDownloadPDF} 
            disabled={isGenerating || !area || !costPerSqm}
            className="w-full min-h-[48px] text-lg bg-slate-800 text-white"
          >
            {isGenerating ? "Membuat PDF..." : "Unduh Dokumen Rencana (PDF)"}
          </Button>
        </div>
      </div>
    </ClientOnly>
  );
}
