import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Linkedin, Github, Sparkles, GraduationCap, Code2, Palette, CheckCircle2 } from 'lucide-react';

export const TeamSection: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Core Student Developers Section */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Core Development Team
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Meet the Project Creators
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Carbon Footprint Fuse was architected and developed by Rithvik Kaki and Pragna Sai, dividing technical implementation and sustainable product design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Rithvik Kaki Card */}
          <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-700 relative">
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-2xl bg-background border-2 border-emerald-500 shadow-md flex items-center justify-center font-bold text-lg text-emerald-700 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                    RK
                  </div>
                </div>
              </div>

              <CardContent className="pt-10 pb-4 px-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-600 transition-colors">
                      Rithvik Kaki
                    </h3>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">
                      Engineering
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Lead Developer & Blockchain Strategist
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                    Key Work Division & Responsibilities:
                  </span>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Full-stack architecture & responsive React/Vite development</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Smart contract tokenomics & decentralized ERC-20 CCT integration</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Web3 MetaMask integration & marketplace order-book transactions</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Local storage persistence & activity synchronization state</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </div>

            <CardContent className="pt-0 pb-6 px-6">
              <div className="pt-3 border-t flex items-center gap-3">
                <a
                  href="mailto:rithvikkaki@gmail.com"
                  title="Email Rithvik Kaki"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/in/rithvik-kaki"
                  target="_blank"
                  rel="noreferrer"
                  title="Rithvik Kaki LinkedIn"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/rithvikkak"
                  target="_blank"
                  rel="noreferrer"
                  title="Rithvik Kaki GitHub"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Pragna Sai Card */}
          <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 flex flex-col justify-between">
            <div>
              <div className="h-24 bg-gradient-to-r from-teal-600 to-emerald-700 relative">
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-2xl bg-background border-2 border-emerald-500 shadow-md flex items-center justify-center font-bold text-lg text-emerald-700 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                    PS
                  </div>
                </div>
              </div>

              <CardContent className="pt-10 pb-4 px-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-600 transition-colors">
                      Pragna Sai
                    </h3>
                    <Badge variant="outline" className="text-[10px] text-teal-700 border-teal-300">
                      Design & Product
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Product Designer & Sustainability Consultant
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-emerald-600" />
                    Key Work Division & Responsibilities:
                  </span>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>UI/UX wireframing, color palette & responsive layout system</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>GHG Protocol emission coefficient calibration & formulas</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Eco-friendly bonus tier mechanics & verified reduction modeling</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Catalog research for green business rewards & corporate partners</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </div>

            <CardContent className="pt-0 pb-6 px-6">
              <div className="pt-3 border-t flex items-center gap-3">
                <a
                  href="mailto:pragna.sai@example.com"
                  title="Email Pragna Sai"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/in/pragna-sai"
                  target="_blank"
                  rel="noreferrer"
                  title="Pragna Sai LinkedIn"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/pragnasai"
                  target="_blank"
                  rel="noreferrer"
                  title="Pragna Sai GitHub"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Mentorship Section */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <Badge variant="outline" className="text-xs px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300">
            <GraduationCap className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Academic Advisory
          </Badge>
          <h3 className="text-xl font-bold text-foreground">
            Project Mentorship & Guidance
          </h3>
        </div>

        <Card className="border-border bg-gradient-to-r from-muted/30 via-background to-muted/30">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500/30 flex items-center justify-center font-bold text-2xl text-emerald-700 dark:text-emerald-300 shrink-0 shadow-sm">
              DK
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h4 className="font-extrabold text-lg text-foreground">
                    Dr. U. Karthikeyan
                  </h4>
                  <Badge className="bg-emerald-700 hover:bg-emerald-800 text-white w-fit mx-auto sm:mx-0">
                    Project Mentor & Faculty Advisor
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Academic Mentor & Research Guide
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Provided institutional guidance, academic supervision, and research direction throughout the conception and implementation of Carbon Footprint Fuse. Mentored the students in scientific emission verification rigor, decentralized consensus evaluation, and project milestone execution.
              </p>

              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                <a
                  href="mailto:karthikeyan@university.edu"
                  title="Email Dr. Karthikeyan"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/in/dr-karthikeyan"
                  target="_blank"
                  rel="noreferrer"
                  title="Dr. Karthikeyan LinkedIn"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/dr-karthikeyan"
                  target="_blank"
                  rel="noreferrer"
                  title="Dr. Karthikeyan GitHub"
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
