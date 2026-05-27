"use client";

import React, { useState, Suspense } from "react";
import { ClientOnly } from "@/components/ui/client-only";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

import { PartnerRecommendation } from "@/components/calculators/partner-recommendation";

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

const BudgetPDF = ({ area, costPerSqm, contingency, total, t }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{t('budget_calculator_pdf_header')}</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Area (m2)</Text>
        <Text style={styles.value}>{area}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Cost per m2</Text>
        <Text style={styles.value}>${costPerSqm.toLocaleString()}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>${(area * costPerSqm).toLocaleString()}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Contingency Buffer (15%)</Text>
        <Text style={styles.value}>${contingency.toLocaleString()}</Text>
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>{t('budget_calculator_total')}</Text>
        <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);

export function HomeBudgetCalculator() {
  const t = (k: string) => k;
  const [area, setArea] = useState<number | "">("");
  const [costPerSqm, setCostPerSqm] = useState<number | "">(3500);
  const [isGenerating, setIsGenerating] = useState(false);

  const subtotal = (Number(area) || 0) * (Number(costPerSqm) || 0);
  const contingency = subtotal * 0.15;
  const total = subtotal + contingency;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<BudgetPDF area={area} costPerSqm={costPerSqm} contingency={contingency} total={total} t={t} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'LifeBloom_Renovation_Budget.pdf';
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
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('budget_calculator_title')}</h2>
        <p className="text-lg text-slate-600 mb-6">
          {t('budget_calculator_desc')}
        </p>

        <Suspense fallback={<div className="h-20 animate-pulse bg-slate-50 border border-slate-200 rounded-2xl mb-6" />}>
          <PartnerRecommendation calculatorSlug="Home Budget Calculator" />
        </Suspense>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-slate-700 mb-2">Area (sqm)</label>
            <Input 
              type="number"
              placeholder="e.g. 45" 
              value={area}
              onChange={(e) => setArea(e.target.value === "" ? "" : Number(e.target.value))}
              className="text-lg min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-slate-700 mb-2">Cost per sqm ($)</label>
            <Input 
              type="number"
              value={costPerSqm}
              onChange={(e) => setCostPerSqm(e.target.value === "" ? "" : Number(e.target.value))}
              className="text-lg min-h-[48px]"
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-xl font-bold text-slate-800">Estimated Total</span>
              <span className="text-3xl font-black text-brand-green">${total.toLocaleString()}</span>
            </div>
          </div>

          <Button 
            onClick={handleDownloadPDF} 
            disabled={isGenerating || !area || !costPerSqm}
            className="w-full min-h-[48px] text-lg bg-slate-800 text-white hover:bg-slate-700"
          >
            {isGenerating ? "Generating PDF..." : "Download Plan (PDF)"}
          </Button>
        </div>
      </div>
    </ClientOnly>
  );
}
