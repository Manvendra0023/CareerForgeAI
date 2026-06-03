"use client";

import Link from "next/link";
import {
  ShieldCheck, Mail, Lock, ArrowRight,
  Eye, AlertTriangle, KeyRound, Globe, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TOOLS = [
  {
    href: "/phishing-analyzer",
    Icon: Mail,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconClass: "text-purple-400",
    title: "Phishing Email Analyzer",
    description: "Paste a suspicious job offer email. AI detects scam patterns, scores the risk 0–100, and tells you exactly what to do.",
    tags: ["Job Scams", "Risk Score", "Red Flags"],
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    cta: "Analyze Email",
    ctaClass: "bg-purple-600 hover:bg-purple-700 text-white",
    bullets: ["Detects fake recruiters & pressure tactics", "Flags suspicious sender domains", "Scores risk from 0 to 100"],
    bulletIcon: "text-purple-400",
  },
  {
    href: "/resume-security-scanner",
    Icon: Lock,
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconClass: "text-cyan-400",
    title: "Resume Security Scanner",
    description: "Paste your resume. AI checks for overshared personal data, identity theft risks, and gives specific fixes for each issue.",
    tags: ["Privacy", "Identity Safety", "Data Protection"],
    tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    cta: "Scan Resume",
    ctaClass: "bg-cyan-600 hover:bg-cyan-700 text-white",
    bullets: ["Flags full address, DOB, sensitive IDs", "Detects confidential company data exposure", "Safety score with priority fixes"],
    bulletIcon: "text-cyan-400",
  },
  {
    href: "/login-threat-detection",
    Icon: KeyRound,
    iconBg: "bg-rose-500/10 border-rose-500/20",
    iconClass: "text-rose-400",
    title: "Login Threat Detection",
    description: "Enter your email address. AI checks for data breach exposure, credential risks, and domain-level threats with a live progress bar.",
    tags: ["Data Breach", "Credentials", "Email Risk"],
    tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    cta: "Check Email",
    ctaClass: "bg-rose-600 hover:bg-rose-700 text-white",
    bullets: ["Checks breach database exposure", "Assesses email domain reputation", "Gives step-by-step security tips"],
    bulletIcon: "text-rose-400",
  },
  {
    href: "/url-safety-checker",
    Icon: Globe,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconClass: "text-blue-400",
    title: "URL Safety Checker",
    description: "Paste a suspicious link. AI checks for phishing, malware risks, domain age, and typosquatting.",
    tags: ["Phishing Links", "Domain Risk", "Malware"],
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cta: "Check URL",
    ctaClass: "bg-blue-600 hover:bg-blue-700 text-white",
    bullets: ["Detects malicious and spoofed domains", "Checks URL structure and parameters", "Scores risk from 0 to 100"],
    bulletIcon: "text-blue-400",
  },
  {
    href: "/recruiter-verification",
    Icon: UserCheck,
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconClass: "text-amber-400",
    title: "Fake Recruiter Verification",
    description: "Verify if a recruiter or job offer is legitimate. AI cross-references the domain, messaging, and common scam tactics.",
    tags: ["Job Scams", "Recruiter Check", "Identity Verification"],
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cta: "Verify Recruiter",
    ctaClass: "bg-amber-600 hover:bg-amber-700 text-white",
    bullets: ["Detects mismatched company domains", "Flags requests for money or suspicious urgency", "Provides a trust score from 0 to 100"],
    bulletIcon: "text-amber-400",
  },
];

export default function CybersecurityHub() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl space-y-10">

      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-1">
          <ShieldCheck className="h-8 w-8 text-cyan-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight gradient-title">
          Cybersecurity Hub
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          5 AI-powered tools to protect your job search from phishing, identity theft, and data breaches.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {[
          { value: "5", label: "Security tools" },
          { value: "1 in 3", label: "Job seekers scammed" },
          { value: "68%", label: "Resumes overshare data" },
          { value: "Free", label: "Powered by Gemini AI" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-0.5">
            <p className="text-xl font-extrabold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tool cards — 2 column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TOOLS.map((tool) => (
          <div key={tool.href} className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 flex flex-col">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl border shrink-0 ${tool.iconBg}`}>
                <tool.Icon className={`h-5 w-5 ${tool.iconClass}`} />
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">{tool.title}</h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map((tag) => (
                <span key={tag} className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${tool.tagColor}`}>
                  {tag}
                </span>
              ))}
            </div>

            <ul className="space-y-1.5 flex-1">
              {tool.bullets.map((b, i) => (
                <li key={i} className={`flex items-start gap-2 text-xs text-foreground/75`}>
                  <ArrowRight className={`h-3 w-3 mt-0.5 shrink-0 ${tool.bulletIcon}`} />{b}
                </li>
              ))}
            </ul>

            <Link href={tool.href}>
              <Button className={`w-full gap-2 ${tool.ctaClass}`} size="sm">
                {tool.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-xs text-foreground/75 leading-relaxed">
          <span className="font-semibold text-yellow-400">Pro tip:</span> Run the Resume Scanner before every job application,
          use the Phishing Analyzer on any unsolicited offer, and check your email for breaches regularly.
        </p>
      </div>
    </div>
  );
}
