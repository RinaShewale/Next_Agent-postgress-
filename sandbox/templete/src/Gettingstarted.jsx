const tips = [
  {
    title: "Be specific",
    body: "\u201CA landing page for a dentist SaaS with pricing and testimonials\u201D beats \u201Cmake a website.\u201D",
  },
  {
    title: "Iterate freely",
    body: "Ask for changes in plain language \u2014 \u201Cmake the hero darker\u201D or \u201Cadd a pricing table.\u201D",
  },
  {
    title: "Ship when ready",
    body: "Once you're happy with it, hit Deploy to publish a permanent, public link.",
  },
];

export default function GettingStarted() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 border-t border-slate-100 px-6 py-16 sm:grid-cols-3">
      {tips.map((tip) => (
        <div key={tip.title} className="text-left">
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            {tip.title}
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">{tip.body}</p>
        </div>
      ))}
    </section>
  );
}