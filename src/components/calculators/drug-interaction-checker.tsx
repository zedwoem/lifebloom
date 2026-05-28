"use client";

import { useState } from 'react';
import { useMounted } from '@/lib/hooks/useMounted';
import { useTrackView } from '@/lib/hooks/useTrackView';
import { checkMultiDrugInteractions } from '@/lib/actions/calculatorActions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmbedGenerator } from '@/components/ui/embed-generator';
import { AlertCircle, FileText, Plus, X } from 'lucide-react';
import { ContextualPartnerCard } from '@/components/features/ContextualPartnerCard';
import { fetchRecommendations } from '@/lib/actions/monetizationActions';
import type { ScoredProduct } from '@/lib/services/contextualMatcherService';
import { Document, Page, Text, View, StyleSheet, pdf, Link as PdfLink } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: {
    padding: '20mm',
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: '#000000',
    lineHeight: 1.5,
  },
  link: {
    fontSize: 12,
    color: '#0000EE',
    textDecoration: 'underline',
  },
  list: {
    marginTop: 10,
    marginLeft: 10,
  }
});
export function DrugInteractionChecker() {
  const isMounted = useMounted();
  const [drugs, setDrugs] = useState<string[]>(['Lisinopril', 'Ibuprofen']);
  const [newDrug, setNewDrug] = useState('');
  const [result, setResult] = useState<{ severity: 'Low' | 'Medium' | 'High', description: string } | null>(null);
  const [recommendations, setRecommendations] = useState<ScoredProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useTrackView('senior/drug-checker', 'tool', 'Drug Interaction Checker', 'senior');

  const addDrug = () => {
    if (newDrug.trim() && !drugs.includes(newDrug.trim())) {
      setDrugs([...drugs, newDrug.trim()]);
      setNewDrug('');
      setResult(null); // Reset result
    }
  };

  const removeDrug = (index: number) => {
    setDrugs(drugs.filter((_, i) => i !== index));
    setResult(null);
  };

  const checkInteractions = async () => {
    if (drugs.length < 2) return;
    setIsLoading(true);
    try {
      const [res, recs] = await Promise.all([
        checkMultiDrugInteractions(drugs),
        fetchRecommendations('senior', 'drug-interaction-checker', { drugsCount: drugs.length }, 1)
      ]);
      setRecommendations(recs);
      if (res) {
        setResult(res);
      } else {
        setResult({
          severity: 'Low',
          description: 'No major interactions detected in the OpenFDA database.'
        });
      }
    } catch (err) {
      console.error(err);
      setResult({
        severity: 'Low',
        description: 'Potential communication issue with the FDA API. Please consult a doctor.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!result) return;
    
    const MyDocument = (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.title}>Medication Summary for Doctor</Text>
          
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>{result.severity} Risk Potential</Text>
            <Text style={pdfStyles.text}>{result.description}</Text>
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>Current Medication List:</Text>
            <View style={pdfStyles.list}>
              {drugs.map((d, i) => (
                <Text key={i} style={pdfStyles.text}>• {d}</Text>
              ))}
            </View>
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>Medical Reference Links:</Text>
            <PdfLink style={pdfStyles.link} src="https://medlineplus.gov/druginformation.html">
              Verify Interactions on MedlinePlus
            </PdfLink>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(MyDocument).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Medication_Summary_Report.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };
  if (!isMounted) return <div className="h-96 w-full animate-pulse bg-slate-100 rounded-3xl" />;

  return (
    <Card className="p-8 max-w-2xl mx-auto border-2 border-brand-blue/10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-brand-blue mb-4">Drug Interaction Checker</h2>
        <p className="text-lg text-slate-500">Check for potential adverse reactions between your daily medications.</p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2">
          <Input
            value={newDrug}
            onChange={(e) => setNewDrug(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDrug()}
            placeholder="E.g., Aspirin, Metformin"
            className="flex-1 text-lg py-6"
          />
          <Button onClick={addDrug} className="h-auto px-6 text-lg">
            <Plus className="w-5 h-5 mr-2" /> Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {drugs.map((drug, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-full font-semibold text-lg">
              {drug}
              <button onClick={() => removeDrug(idx)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <Button 
          onClick={checkInteractions} 
          disabled={drugs.length < 2 || isLoading}
          className="w-full py-6 text-xl bg-brand-green hover:bg-brand-green-dark text-white shadow-lg shadow-brand-green/20"
        >
          {isLoading ? 'Checking...' : 'Check Interactions'}
        </Button>

        {result && (
          <div id="print-summary" className={`mt-8 p-6 rounded-2xl border-2 ${result.severity === 'High' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-start gap-4">
              <AlertCircle className={`w-8 h-8 flex-shrink-0 ${result.severity === 'High' ? 'text-red-600' : 'text-green-600'}`} />
              <div>
                <h3 className={`text-2xl font-black mb-2 ${result.severity === 'High' ? 'text-red-700' : 'text-green-700'}`}>
                  {result.severity} Risk Potential
                </h3>
                <p className="text-xl leading-relaxed text-slate-800 font-medium">
                  {result.description}
                </p>
                
                <div className="mt-6 pt-6 border-t border-current/20">
                  <p className="text-sm font-bold uppercase tracking-wider mb-2 opacity-70">Current Medication List:</p>
                  <ul className="list-disc list-inside text-lg font-bold">
                    {drugs.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-6 animate-fade-in-up">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Rekomendasi Ahli</h3>
            <ContextualPartnerCard 
              product={recommendations[0]} 
              calculatorSlug="drug-interaction-checker" 
            />
          </div>
        )}

        {result && (
          <div className="flex justify-center mt-6">
            <Button onClick={generatePDF} variant="outline" className="gap-2 text-lg py-6 border-2 border-slate-300">
              <FileText className="w-6 h-6 text-slate-600" />
              Print High-Contrast PDF for Doctor
            </Button>
          </div>
        )}

        {/* Accessible Elder Advisory Guide Block */}
        <div className="mt-8 p-6 bg-[#f5fff7] border border-[#006948]/20 rounded-2xl">
          <h3 className="text-xl font-bold text-[#006948] mb-3 flex items-center gap-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            🛡️ Safe Medication Advisory & Fall Prevention Guide
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Did you know that taking multiple medications (known as <strong>polypharmacy</strong>) is one of the leading causes of balance issues and falls in older adults? 
            ACE inhibitors (for blood pressure) combined with standard NSAIDs (like Ibuprofen or Naproxen) can affect kidney function and lead to sudden lightheadedness.
          </p>
          <ul className="text-xs text-slate-500 list-disc list-inside space-y-2">
            <li><strong>Keep an Active Log:</strong> Always write down every prescription, OTC drug, and herbal supplement you take.</li>
            <li><strong>Timing Matters:</strong> Spacing out blood pressure medication can help prevent sudden drops in pressure upon standing (orthostatic hypotension).</li>
            <li><strong>Consult Regularly:</strong> Bring your printed high-contrast Medication Summary Report to every doctor visit.</li>
          </ul>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        </div>
      </div>
      
      <EmbedGenerator slug="drug-interaction-checker" title="Drug Interaction Checker" />
    </Card>
  );
}
