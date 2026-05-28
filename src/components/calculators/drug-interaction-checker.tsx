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
  const [result, setResult] = useState<{ severity: 'Low' | 'Medium' | 'High', description: string, details?: { total_events: number, reactions: string[] } } | null>(null);
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
          description: 'No major interactions detected in the OpenFDA database.',
          details: { total_events: 0, reactions: [] }
        });
      }
    } catch (err) {
      console.error(err);
      setResult({
        severity: 'Low',
        description: 'Potential communication issue with the FDA API. Please consult a doctor.',
        details: { total_events: 0, reactions: [] }
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

          {result.details && result.details.reactions && result.details.reactions.length > 0 && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.heading}>Reported Patient Clinical Symptoms:</Text>
              <View style={pdfStyles.list}>
                {result.details.reactions.map((r, i) => (
                  <Text key={i} style={pdfStyles.text}>• {r}</Text>
                ))}
              </View>
            </View>
          )}

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
        <h2 className="text-3xl font-black text-brand-blue mb-4" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>Medication Safety Checker</h2>
        <p className="text-lg text-slate-500">Gently review your daily prescriptions to ensure they work together safely.</p>
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
          <div id="print-summary" className={`mt-8 p-6 md:p-8 rounded-3xl border-2 animate-fade-in ${
            result.severity === 'High' 
              ? 'bg-rose-50 border-rose-200' 
              : result.severity === 'Medium'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-emerald-50/50 border-emerald-100'
          }`}>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <AlertCircle className={`w-8 h-8 flex-shrink-0 mt-1 ${
                  result.severity === 'High' 
                    ? 'text-rose-600' 
                    : result.severity === 'Medium'
                    ? 'text-amber-500'
                    : 'text-emerald-600'
                }`} />
                <div className="flex-1">
                  <h3 className={`text-2xl font-black mb-2 ${
                    result.severity === 'High' 
                      ? 'text-rose-800' 
                      : result.severity === 'Medium'
                      ? 'text-amber-800'
                      : 'text-emerald-800'
                  }`}>
                    {result.severity} Interaction Potential
                  </h3>
                  
                  {/* Visual Severity Meter */}
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden my-4">
                    <div className={`h-full transition-all duration-500 ${
                      result.severity === 'High'
                        ? 'w-full bg-rose-600'
                        : result.severity === 'Medium'
                        ? 'w-2/3 bg-amber-500'
                        : 'w-1/3 bg-emerald-500'
                    }`} />
                  </div>

                  <p className="text-lg leading-relaxed text-slate-700 font-medium">
                    {result.description}
                  </p>
                  
                  {result.details && result.details.reactions && result.details.reactions.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-slate-200/60">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Reported Clinical Symptoms:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.details.reactions.map((reaction, i) => (
                          <span key={i} className="px-3 py-1 bg-white text-slate-700 border border-slate-200 text-xs font-bold rounded-lg shadow-sm">
                            {reaction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-slate-200/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Checked Medication Regimen:</p>
                    <div className="flex flex-wrap gap-2">
                      {drugs.map((d, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 text-sm font-bold rounded-full">
                          💊 {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-6 animate-fade-in-up">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Expert Recommendation</h3>
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
        <div className="mt-8 p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-emerald-800 mb-3 flex items-center gap-2" style={{ fontFamily: "Atkinson Hyperlegible Next, sans-serif" }}>
            🛡️ Safe Medication & Fall Prevention Guide
          </h3>
          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed mb-4">
            Taking multiple medications (polypharmacy) is one of the leading causes of balance issues and falls in older adults. For instance, combining blood pressure medications with standard pain relievers can lead to sudden lightheadedness. We&apos;re here to help you stay balanced and secure.
          </p>
          <ul className="text-sm text-slate-600 font-medium list-disc list-inside space-y-2">
            <li><strong>Keep an Active Log:</strong> Always write down every prescription, OTC drug, and herbal supplement you take.</li>
            <li><strong>Timing Matters:</strong> Spacing out blood pressure medication can help prevent sudden drops in pressure when standing.</li>
            <li><strong>Consult Regularly:</strong> Print your high-contrast Medication Summary Report to share with your doctor.</li>
          </ul>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        </div>
      </div>
      
      <EmbedGenerator slug="drug-interaction-checker" title="Drug Interaction Checker" />
    </Card>
  );
}
