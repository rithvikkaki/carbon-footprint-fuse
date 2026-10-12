import React, { useState } from 'react';
import { TeamSection } from '@/components/about/TeamSection';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, HelpCircle, Target, Sparkles } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How are carbon credits (CCT) calculated and verified on EcoFuse?',
    answer: 'We utilize internationally validated emission formulas (IPCC Guidelines and GHG Protocol). Every logged activity is cross-verified against baseline parameters (e.g. regional grid coefficients, EPA vehicle factors). Once certified, smart contracts mint ERC-20 CCT tokens representing verified metric reduction blocks.',
  },
  {
    question: 'Can individual households participate, or is this only for large enterprises?',
    answer: 'EcoFuse is designed for both! Individuals can calculate daily lifestyle footprints (transport, food, heating, recycling), earn tokens, and redeem green rewards. Enterprises use our platform for scope-1, scope-2, and scope-3 supply chain audits and corporate offset retirement certificates.',
  },
  {
    question: 'What is the utility of the CCT token?',
    answer: 'CCT can be: (1) Traded on the decentralized marketplace order book for USD/stablecoins, (2) Redeemed for verified sustainable perks like EV charging passes and tree planting certificates, or (3) Permanently burned to obtain verifiable ESG compliance certificates.',
  },
  {
    question: 'Do I need cryptocurrency experience to use the calculator and dashboard?',
    answer: 'Not at all! You can sign up using a standard email and password. All carbon metrics, calculators, and activities function seamlessly in fiat and standard units. You can connect a MetaMask wallet anytime you wish to export tokens on-chain.',
  },
  {
    question: 'How do I collaborate or partner with Carbon Footprint Fuse as an eco-vendor or organization?',
    answer: 'Reach out to our founding team directly via email (rithvikkaki@gmail.com, pragna.sai@example.com, or karthikeyan@university.edu) or connect your organization profile via the Collaborations tab on the dashboard.',
  },
];

export const About: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-16">
      {/* Mission Section */}
      <section className="max-w-3xl mx-auto text-center space-y-4">
        <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300">
          Our Vision & Purpose
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
          Pioneering Transparent Climate Action
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The global climate crisis demands accountable, fraud-resistant mechanisms. Carbon Footprint Fuse bridges grassroots ecological stewardship with transparent decentralized financial primitives, rewarding every verified gram of CO₂ kept out of our atmosphere.
        </p>
      </section>

      {/* Team Section */}
      <section>
        <TeamSection />
      </section>

      {/* FAQs Section */}
      <section id="faq" className="max-w-3xl mx-auto space-y-6 pt-4">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs">
            <HelpCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card
                key={idx}
                className="border-border cursor-pointer transition-colors"
                onClick={() => toggleFaq(idx)}
              >
                <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {faq.question}
                  </CardTitle>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                  )}
                </CardHeader>
                {isOpen && (
                  <CardContent className="px-6 pb-4 pt-0 text-xs text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default About;
