export function generateStaticParams() {
  return [
    { doc: 'terms' },
    { doc: 'privacy' },
    { doc: 'knowledge' },
  ];
}

export default async function DocumentPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;

  let title = "Document";
  let lastUpdated = "May 25, 2026";
  let content = [];

  if (doc === 'terms') {
    title = "Terms of Service";
    content = [
      { h: "1. Acceptance of Terms", p: "By accessing LifeBloom Hub, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service." },
      { h: "2. Use of Calculators", p: "Our tools and calculators are provided for educational and informational purposes only. They do not constitute financial or medical advice." },
      { h: "3. User Accounts", p: "When you create an account, you must provide accurate information. You are responsible for safeguarding your password." }
    ];
  } else if (doc === 'privacy') {
    title = "Privacy Policy";
    content = [
      { h: "1. Data Collection", p: "We collect information you provide directly to us, such as when you create an account, save a calculation, or contact support." },
      { h: "2. How We Use Your Data", p: "We use the information to provide, maintain, and improve our services, as well as to personalize your experience on the platform." },
      { h: "3. Data Security", p: "We implement robust security measures to protect your personal information, though no method of transmission over the Internet is 100% secure." }
    ];
  } else {
    title = "Knowledge Base";
    content = [
      { h: "Getting Started", p: "Welcome to LifeBloom Hub! To get started, explore our 5 main pillars from the homepage." },
      { h: "Saving Calculators", p: "Create a free account to save your progress on the Retirement Calculator and Home Budget Planner." },
    ];
  }

  return (
    <article className="animate-fade-in prose prose-slate max-w-none prose-headings:text-brand-blue prose-a:text-brand-green">
      <h1 className="text-4xl font-black mb-2">{title}</h1>
      <p className="text-slate-400 text-sm mb-12">Last updated: {lastUpdated}</p>

      <div className="space-y-8">
        {content.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-2xl font-bold mb-4">{section.h}</h2>
            <p className="text-slate-600 leading-relaxed text-lg">{section.p}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
