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
      { h: "1. Acceptance of Terms", p: "By accessing and using LifeBloom Hub, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services." },
      { h: "2. Medical & Financial Disclaimer", p: "The content, calculators, and tools on LifeBloom Hub are provided for educational and informational purposes only. They do not constitute professional medical, legal, or financial advice. Always consult with a qualified healthcare provider or a certified financial planner before making significant decisions." },
      { h: "3. User Accounts and Security", p: "When creating an account, you agree to provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account." },
      { h: "4. Affiliate and Third-Party Links", p: "Some links on our platform may be affiliate links. We may earn a commission if you click through and make a purchase. However, our reviews and recommendations remain strictly independent and unbiased, adhering to our editorial integrity standards." }
    ];
  } else if (doc === 'privacy') {
    title = "Privacy Policy";
    content = [
      { h: "1. Information Collection", p: "We collect information you provide directly to us when creating an account, participating in interactive calculators, or subscribing to our newsletters. This may include your name, email address, and generalized mood data." },
      { h: "2. How We Use Your Data", p: "Your data is utilized strictly to provide, maintain, and personalize your experience on LifeBloom Hub. We do not sell your personal data to third parties. Anonymized, aggregated data may be used to improve our services and algorithms." },
      { h: "3. Cookies and Local Storage", p: "We employ cookies and local storage (such as your personalization nickname) to enhance site navigation, analyze site usage, and assist in our marketing efforts. You can control cookie preferences through your browser settings." },
      { h: "4. Data Security", p: "We implement industry-standard encryption and security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security." }
    ];
  } else {
    title = "Knowledge Base & FAQ";
    content = [
      { h: "Getting Started with LifeBloom Hub", p: "Welcome to your personal growth ecosystem! LifeBloom Hub is structured across core pillars: Senior Wellness, Finance, Pet Family, Home Living, and Accessible Travel. Use the main navigation or global search to explore topics." },
      { h: "Saving Calculators and Progress", p: "To save your calculations (e.g., Retirement Planner, Budget Renovator), you must create a free account. Your data is securely stored in your personal dashboard for easy access." },
      { h: "Editorial Integrity and E-E-A-T", p: "We pride ourselves on Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T). Our articles are reviewed by industry professionals, and all factual claims are linked to reputable sources." }
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
