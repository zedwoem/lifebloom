"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, ArrowRight, RefreshCcw } from 'lucide-react';

// Mubaidr/javascript-decision-tree logical port for client-side React
const decisionTree = {
  question: "Is your dog breathing rapidly or having trouble breathing?",
  yes: {
    result: "EMERGENCY: Seek veterinary care immediately. This could be life-threatening.",
    severity: "High"
  },
  no: {
    question: "Is your dog vomiting repeatedly or unable to keep water down?",
    yes: {
      question: "Is there blood in the vomit, or is the dog lethargic?",
      yes: {
        result: "EMERGENCY: Seek veterinary care immediately. Possible toxicity or obstruction.",
        severity: "High"
      },
      no: {
        result: "Monitor closely. Withhold food for 12 hours, offer small sips of water. If vomiting continues for 24h, see a vet.",
        severity: "Medium"
      }
    },
    no: {
      question: "Is your dog limping or showing signs of pain when walking?",
      yes: {
        result: "Restrict exercise. If it persists for more than 48 hours or the dog cries in pain, schedule a non-emergency vet visit.",
        severity: "Low"
      },
      no: {
        result: "No obvious physical emergencies detected based on these questions. Monitor normally.",
        severity: "Low"
      }
    }
  }
};

export function CanineSymptomDecisionTree() {
  const [currentNode, setCurrentNode] = useState<any>(decisionTree);
  const [history, setHistory] = useState<any[]>([]);

  const handleAnswer = (answer: 'yes' | 'no') => {
    setHistory([...history, { question: currentNode.question, answer }]);
    setCurrentNode(currentNode[answer]);
  };

  const resetTree = () => {
    setCurrentNode(decisionTree);
    setHistory([]);
  };

  return (
    <Card className="mb-8 border-2 border-brand-green/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-green-light rounded-xl">
            <Stethoscope className="w-6 h-6 text-brand-green-dark" />
          </div>
          <div>
            <CardTitle>Canine Symptom Triage</CardTitle>
            <CardDescription>A guided decision tree to assess your dog&apos;s symptoms safely at home.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="p-6">
        {currentNode.result ? (
          <div className={`p-6 rounded-2xl border-2 ${
            currentNode.severity === 'High' ? 'bg-red-50 border-red-200' : 
            currentNode.severity === 'Medium' ? 'bg-amber-50 border-amber-200' : 
            'bg-green-50 border-green-200'
          }`}>
            <h3 className={`text-2xl font-black mb-2 ${
              currentNode.severity === 'High' ? 'text-red-700' : 
              currentNode.severity === 'Medium' ? 'text-amber-700' : 
              'text-green-700'
            }`}>
              {currentNode.severity} Risk
            </h3>
            <p className="text-xl text-slate-800 font-medium mb-6">{currentNode.result}</p>
            <Button onClick={resetTree} variant="outline" className="gap-2">
              <RefreshCcw className="w-4 h-4" /> Start Over
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in text-center py-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 max-w-lg mx-auto leading-relaxed">
              {currentNode.question}
            </h3>
            <div className="flex justify-center gap-6">
              <Button onClick={() => handleAnswer('yes')} className="w-32 py-6 text-xl bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20">
                Yes
              </Button>
              <Button onClick={() => handleAnswer('no')} className="w-32 py-6 text-xl bg-brand-green hover:bg-brand-green-dark shadow-lg shadow-brand-green/20">
                No
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
