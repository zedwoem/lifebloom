"use client";

import { useState } from 'react';
import { Calculator, Save, Check } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RetirementCalculator() {
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentAge, setCurrentAge] = useState(55);
  const [retireAge, setRetireAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);

  const generateChartData = () => {
    const data = [];
    const years = retireAge - currentAge;
    
    let optVal = currentSavings;
    let realVal = currentSavings;
    let pessVal = currentSavings;

    for (let i = 0; i <= years; i++) {
      data.push({
        age: currentAge + i,
        Optimistic: Math.round(optVal),
        Realistic: Math.round(realVal),
        Pessimistic: Math.round(pessVal)
      });
      // Add annual contributions and returns (Compounded annually for simplicity)
      // Optimistic (+7%), Realistic (+4.5% considering inflation), Pessimistic (+2% recession)
      optVal = (optVal + monthlyContribution * 12) * 1.07;
      realVal = (realVal + monthlyContribution * 12) * 1.045;
      pessVal = (pessVal + monthlyContribution * 12) * 1.02;
    }
    return data;
  };

  const chartData = generateChartData();
  const projectedAmount = chartData[chartData.length - 1]?.Realistic || 0;

  const handleSave = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    try {
      await fetch('/api/user/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          calculatorSlug: 'retirement',
          inputParams: { currentAge, retireAge, currentSavings, monthlyContribution },
          outputResults: { projectedAmount }
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-green-light rounded-xl">
            <Calculator className="w-6 h-6 text-brand-green-dark" />
          </div>
          <div>
            <CardTitle>Retirement Projection</CardTitle>
            <CardDescription>Estimate your nest egg growth over time.</CardDescription>
          </div>
        </div>
        
        {profile && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving || saved}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {saved ? <><Check className="w-4 h-4 text-brand-green" /> Saved</> : <><Save className="w-4 h-4" /> Save</>}
          </Button>
        )}
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        <div className="space-y-6">
          <Input 
            type="number" 
            label="Current Age"
            value={currentAge} 
            onChange={e => setCurrentAge(Number(e.target.value))} 
            min={40} max={90}
          />
          <Input 
            type="number" 
            label="Planned Retirement Age"
            value={retireAge} 
            onChange={e => setRetireAge(Number(e.target.value))} 
            min={50} max={100}
          />
          <Input 
            type="number" 
            label="Current Savings ($)"
            value={currentSavings} 
            onChange={e => setCurrentSavings(Number(e.target.value))} 
            min={0}
          />
          <Input 
            type="number" 
            label="Monthly Contribution ($)"
            value={monthlyContribution} 
            onChange={e => setMonthlyContribution(Number(e.target.value))} 
            min={0}
          />
        </div>

        <div className="bg-brand-slate-light rounded-3xl p-8 flex flex-col justify-center items-center text-center border-2 border-brand-slate-light">
          <p className="text-brand-slate font-semibold mb-2">Projected Realistic Savings at Age {retireAge}</p>
          <div className="text-5xl md:text-6xl font-black text-brand-green tracking-tight mb-8">
            ${projectedAmount.toLocaleString()}
          </div>
          
          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                <YAxis tickFormatter={(val) => `$${(val / 1000)}k`} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} width={60} />
                <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                <Area type="monotone" dataKey="Optimistic" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOpt)" />
                <Area type="monotone" dataKey="Realistic" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorReal)" />
                <Area type="monotone" dataKey="Pessimistic" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorPess)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <p className="text-sm text-brand-slate mt-6 opacity-75">
            *Projections: Optimistic (+7%), Realistic (+4.5% considering inflation), Pessimistic (+2% recession). This is an estimate, not financial advice.
          </p>
        </div>
      </div>
    </Card>
  );
}
