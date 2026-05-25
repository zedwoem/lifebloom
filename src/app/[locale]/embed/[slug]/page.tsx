import { notFound } from 'next/navigation';
import { RetirementCalculator } from '@/components/calculators/retirement-calculator';
import { HomeBudgetCalculator } from '@/components/calculators/home-budget-calculator';
import { PetMatchmaker } from '@/components/calculators/pet-matchmaker';

export default async function EmbedPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  let CalculatorComponent = null;

  if (slug === 'retirement-calculator') {
    CalculatorComponent = RetirementCalculator;
  } else if (slug === 'home-budget-calculator') {
    CalculatorComponent = HomeBudgetCalculator;
  } else if (slug === 'pet-matchmaker') {
    CalculatorComponent = PetMatchmaker;
  } else {
    notFound();
  }

  return (
    <div className="w-full h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      <CalculatorComponent />
      <div className="bg-brand-slate-light p-3 text-center text-xs text-brand-slate border-t border-slate-200">
        Powered by <a href="https://lifebloom.hub" target="_blank" rel="noopener noreferrer" className="text-brand-green font-bold">LifeBloom Hub</a>
      </div>
    </div>
  );
}
