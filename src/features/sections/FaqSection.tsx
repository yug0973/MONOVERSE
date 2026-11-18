import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'When is possession scheduled and what is the regulatory RERA status?',
      answer:
        'Aarohan Residences has a projected possession timeline of December 2026 upon issuance of the Vadodara Municipal Corporation Building Use (BU) certificate. As this digital demonstration is an architectural technology showcase for developers, regulatory details are formatted under DEMO-RERA-0000 to maintain compliance.',
    },
    {
      question: 'At what stage of construction can I customize my interior finishes?',
      answer:
        'Customization choices (wall palettes, Italian/Indian marble, and herringbone flooring) are finalized prior to the casting of the 10th floor slab. This ensures internal plumbing, electrical rough-ins, and surface screeds are poured seamlessly without construction delays.',
    },
    {
      question: 'How are parking allocations and EV charging handled across basements?',
      answer:
        'Each 2 BHK and 3 BHK residence receives one reserved covered basement slot. 3 BHK Premium homes include two dedicated slots. Both basement levels B1 and B2 feature 22kW AC fast-charging mobility bays connected directly to each resident’s individual sub-meter.',
    },
    {
      question: 'What are the projected society maintenance charges for Club Aarohan?',
      answer:
        'Club and podium common area maintenance is projected at ₹3.20 per square foot of carpet area per month. This covers round-the-clock security, maintenance of the 25m skyline lap pool, high-speed Schindler elevators, and the Miyawaki landscaped grove.',
    },
    {
      question: 'Which lending institutions provide home loans for this project?',
      answer:
        'Demonstration financing schedules assume pre-vetted approvals across major nationalized and private retail banks including State Bank of India, HDFC Bank, ICICI Bank, and Bank of Baroda with standard 80% loan-to-value parameters.',
    },
    {
      question: 'What is the formal procedure to book a residence after a site visit?',
      answer:
        'Following your hosted physical visit at the Sevasi-Bhayli site experience gallery, your desired unit is reserved upon payment of a 10% booking allotment. Construction payments follow our Gujarat RERA-compliant milestone schedule.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-canvas border-t border-canvas-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
            Clarity & Diligence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink-primary mt-2">
            Frequently answered questions
          </h2>
          <p className="text-sm text-ink-muted mt-2">
            Transparent details regarding construction milestones, finishes, approvals, and ownership.
          </p>
        </div>

        <div className="divide-y divide-canvas-muted border border-canvas-muted rounded-lg bg-canvas-light shadow-soft overflow-hidden">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question} className="transition-colors">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 focus-visible:outline-accent-terracotta"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg font-medium text-ink-primary">
                    {faq.question}
                  </span>
                  <span
                    className={`p-1 rounded text-ink-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-accent-terracotta' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-ink-muted leading-relaxed border-t border-canvas-muted/40 bg-canvas-subtle/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
