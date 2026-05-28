"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, ArrowRight, RefreshCcw, ShieldAlert, PhoneCall, MapPin } from 'lucide-react';

const decisionTree = {
  question: "Is your dog breathing rapidly, panting excessively, or having clear difficulty breathing?",
  yes: {
    result: "EMERGENCY: Seek professional veterinary care immediately. Breathing distress is a critical indicator of respiratory or cardiovascular failure.",
    severity: "Critical",
    action: "Urgent Vet Visit Required"
  },
  no: {
    question: "Is your dog vomiting repeatedly, bloated, or unable to keep fresh water down?",
    yes: {
      question: "Is there blood visible in the vomit, or is your dog extremely lethargic and unresponsive?",
      yes: {
        result: "EMERGENCY: Seek veterinary care immediately. Possible ingestion of hazardous toxins, gastrointestinal obstruction, or internal bleeding.",
        severity: "Critical",
        action: "Urgent Vet Visit Required"
      },
      no: {
        result: "Monitor closely. Withhold food for 12 hours, offer small sips of clean water. If symptoms persist beyond 24 hours, consult a professional.",
        severity: "Moderate",
        action: "Consult Vet via Phone"
      }
    },
    no: {
      question: "Is your dog limping, favoring a leg, or whimpering when moving?",
      yes: {
        result: "Restrict physical activity. Prevent jumping or running. If lameness persists for more than 48 hours, schedule a clinical checkup.",
        severity: "Mild",
        action: "Schedule Vet Appointment"
      },
      no: {
        result: "No immediate critical physical symptoms detected based on your answers. Continue routine health monitoring.",
        severity: "Normal",
        action: "Routine Monitoring"
      }
    }
  }
};

export function CanineSymptomDecisionTree() {
  const [currentNode, setCurrentNode] = useState<any>(decisionTree);
  const [history, setHistory] = useState<any[]>([]);

  const handleAnswer = (answer: 'yes' | 'no') => {
    setHistory([...history, currentNode]);
    setCurrentNode(currentNode[answer]);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const previousNode = history[history.length - 1];
    setCurrentNode(previousNode);
    setHistory(history.slice(0, -1));
  };

  const resetTree = () => {
    setCurrentNode(decisionTree);
    setHistory([]);
  };

  return (
    <Card className="mb-8 border border-slate-200/80 shadow-md bg-[#FAF6F0] rounded-3xl overflow-hidden font-sans">
      {/* 1. Medical Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200/60 px-5 py-3.5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed font-medium">
          <strong>Important Medical Disclaimer:</strong> This symptom triage tool is driven by automated decision trees for educational guidance only. It does not replace professional veterinary diagnostics, clinical examinations, or emergency treatments. Always contact a certified vet immediately if you feel your pet is in danger.
        </p>
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E3EFE9] rounded-2xl shrink-0">
            <Stethoscope className="w-6 h-6 text-[#2D5A46]" />
          </div>
          <div>
            <CardTitle className="text-[#2D5A46] text-xl font-bold tracking-tight">Canine Triage Assistant</CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Assess your dog&apos;s wellness steps and identify potential urgencies securely.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="px-6 pb-6 pt-2">
        {currentNode.result ? (
          <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
            currentNode.severity === 'Critical' 
              ? 'bg-rose-50/80 border-rose-200 text-rose-950' 
              : currentNode.severity === 'Moderate' 
              ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                currentNode.severity === 'Critical' 
                  ? 'bg-rose-100 text-rose-700' 
                  : currentNode.severity === 'Moderate' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {currentNode.severity} Priority
              </span>
              <span className="text-xs text-slate-500 font-mono">Status: {currentNode.action}</span>
            </div>

            <p className="text-lg md:text-xl font-bold leading-snug mb-6">{currentNode.result}</p>
            
            {/* Quick Action Clinical Links */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href="tel:18005550199"
                className="inline-flex items-center justify-center gap-2 bg-[#E07A5F] hover:bg-[#D0694E] text-white px-5 py-3 rounded-xl font-bold transition-all text-sm shadow-md hover:scale-[1.02]"
              >
                <PhoneCall className="w-4 h-4" /> Call 24/7 Pet Helpline
              </a>
              <a
                href="https://www.google.com/maps/search/veterinary+clinic+near+me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#2D5A46] hover:bg-[#204333] text-white px-5 py-3 rounded-xl font-bold transition-all text-sm shadow-md hover:scale-[1.02]"
              >
                <MapPin className="w-4 h-4" /> Find Nearest Vet Clinic
              </a>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetTree} variant="outline" className="gap-2 rounded-xl hover:bg-slate-100 border-slate-300">
                <RefreshCcw className="w-4 h-4" /> Start Over
              </Button>
              {history.length > 0 && (
                <Button onClick={handleBack} variant="ghost" className="rounded-xl hover:bg-slate-200/50">
                  Back
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in py-6">
            {/* Progress indicators */}
            <div className="flex items-center gap-1.5 mb-6">
              <div className={`h-1.5 rounded-full flex-grow transition-all duration-300 ${history.length >= 0 ? 'bg-[#2D5A46]' : 'bg-slate-200'}`} />
              <div className={`h-1.5 rounded-full flex-grow transition-all duration-300 ${history.length >= 1 ? 'bg-[#2D5A46]' : 'bg-slate-200'}`} />
              <div className={`h-1.5 rounded-full flex-grow transition-all duration-300 ${history.length >= 2 ? 'bg-[#2D5A46]' : 'bg-slate-200'}`} />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 max-w-xl leading-relaxed">
              {currentNode.question}
            </h3>

            <div className="flex flex-wrap items-center gap-4">
              <Button 
                onClick={() => handleAnswer('yes')} 
                className="px-8 py-6 text-lg font-bold rounded-2xl bg-[#E07A5F] hover:bg-[#D0694E] text-white shadow-md transition-all hover:scale-[1.02] shrink-0"
              >
                Yes, this is true
              </Button>
              <Button 
                onClick={() => handleAnswer('no')} 
                className="px-8 py-6 text-lg font-bold rounded-2xl bg-[#2D5A46] hover:bg-[#204333] text-white shadow-md transition-all hover:scale-[1.02] shrink-0"
              >
                No, not present
              </Button>
              
              <div className="w-full sm:w-auto sm:ml-auto flex gap-2">
                {history.length > 0 && (
                  <Button onClick={handleBack} variant="outline" className="rounded-xl border-slate-300">
                    Back
                  </Button>
                )}
                <Button onClick={resetTree} variant="ghost" className="rounded-xl">
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
