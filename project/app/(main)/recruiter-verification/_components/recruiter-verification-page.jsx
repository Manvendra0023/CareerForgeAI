"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldX, ShieldAlert, ShieldCheck, Shield,
  Loader2, AlertTriangle, CheckCircle2,
  UserCheck, RotateCcw, ArrowRight, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { verifyRecruiter } from "@/actions/security";
import useFetch from "@/hooks/use-fetch";

const TRUST = {
  SCAM:         { label: "Likely Scam",        color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",       barColor: "bg-red-500",    Icon: ShieldX },
  LOW_TRUST:    { label: "Highly Suspicious",  color: "text-orange-400", bg: "bg-orange-500/10 border-orange-400/30", barColor: "bg-orange-500", Icon: ShieldAlert },
  MEDIUM_TRUST: { label: "Caution Advised",    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-400/30", barColor: "bg-yellow-500", Icon: Shield },
  HIGH_TRUST:   { label: "Appears Legitimate", color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",   barColor: "bg-green-500",  Icon: ShieldCheck },
};

const STEPS = [
  "Cross-referencing domain data…",
  "Analyzing message patterns…",
  "Checking for known scam tactics…",
  "Evaluating recruiter profile…",
  "Generating trust report…",
];

export default function RecruiterVerificationPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    linkedin: "",
    message: "",
  });
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef(null);

  const { loading: isVerifying, fn: verifyFn, data, error } = useFetch(verifyRecruiter);

  useEffect(() => { if (data) setResult(data); }, [data]);
  useEffect(() => { if (error) toast.error(error.message || "Verification failed."); }, [error]);

  // Animate progress bar while checking
  useEffect(() => {
    if (isVerifying) {
      setProgress(0);
      setStepIndex(0);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) { clearInterval(intervalRef.current); return 90; }
          const next = p + 1.2;
          setStepIndex(Math.min(Math.floor((next / 90) * STEPS.length), STEPS.length - 1));
          return next;
        });
      }, 80);
    } else {
      clearInterval(intervalRef.current);
      if (result) setProgress(100);
    }
    return () => clearInterval(intervalRef.current);
  }, [isVerifying, result]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerify = () => {
    if (!formData.company.trim() && !formData.email.trim()) {
      toast.error("Please provide at least a company name or email.");
      return;
    }
    setResult(null);
    setProgress(0);
    verifyFn(formData);
  };

  const handleReset = () => {
    setResult(null);
    setFormData({ name: "", company: "", email: "", linkedin: "", message: "" });
    setProgress(0);
  };

  const cfg = result ? TRUST[result.trustLevel] || TRUST.LOW_TRUST : null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-amber-400" />
          <h1 className="text-2xl font-bold">Fake Recruiter Verification</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Check if a recruiter or job offer is legitimate. Provide as much info as you can.
        </p>
      </div>

      {/* Input Form */}
      {!result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Recruiter Name</Label>
              <Input id="name" name="name" placeholder="John Smith" value={formData.name} onChange={handleChange} disabled={isVerifying} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-xs">Company Name <span className="text-muted-foreground">(Required if no email)</span></Label>
              <Input id="company" name="company" placeholder="TechCorp" value={formData.company} onChange={handleChange} disabled={isVerifying} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Recruiter Email <span className="text-muted-foreground">(Required if no company)</span></Label>
              <Input id="email" name="email" type="email" placeholder="john@techcorp.com" value={formData.email} onChange={handleChange} disabled={isVerifying} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedin" className="text-xs">LinkedIn URL <span className="text-muted-foreground">(Optional)</span></Label>
              <Input id="linkedin" name="linkedin" placeholder="linkedin.com/in/johnsmith" value={formData.linkedin} onChange={handleChange} disabled={isVerifying} />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs">Message / Context <span className="text-muted-foreground">(Optional)</span></Label>
            <Textarea 
              id="message" 
              name="message" 
              placeholder="Paste the message they sent you here..." 
              value={formData.message} 
              onChange={handleChange} 
              disabled={isVerifying}
              className="resize-none h-24"
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={isVerifying || (!formData.company.trim() && !formData.email.trim())}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {isVerifying ? "Verifying…" : "Verify Recruiter"}
          </Button>

          {/* Progress bar */}
          {isVerifying && (
            <div className="space-y-2 mt-4">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-amber-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground animate-pulse">{STEPS[stepIndex]}</p>
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">

          {/* Progress complete */}
          <div className="space-y-1.5">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className={`h-2 rounded-full w-full transition-all duration-500 ${cfg.barColor}`} />
            </div>
            <p className="text-xs text-green-400 text-right">Verification complete ✓</p>
          </div>

          {/* Trust summary */}
          <div className={`rounded-xl border p-5 space-y-2 ${cfg.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
                <span className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-extrabold ${cfg.color}`}>
                  {result.trustScore}
                </span>
                <span className="text-sm font-normal text-muted-foreground">/100</span>
                <p className="text-[10px] text-muted-foreground">trust score</p>
              </div>
            </div>
            <p className="text-sm text-foreground/85 font-medium">{result.verdict}</p>
            <p className="text-xs text-muted-foreground">{result.summary}</p>
          </div>

          {/* Red flags detected */}
          {result.redFlags?.length > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
              <p className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Red Flags Detected
              </p>
              <ul className="space-y-1.5">
                {result.redFlags.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <ArrowRight className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safe signals */}
          {result.safeSignals?.length > 0 && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2">
              <p className="text-sm font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Safe Signals
              </p>
              <ul className="space-y-1.5">
                {result.safeSignals.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <ArrowRight className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {result.nextSteps?.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-muted/40 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-1">WHAT TO DO NEXT</p>
              <ul className="space-y-1.5">
                {result.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/85">
                    <ArrowRight className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />{step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button variant="outline" onClick={handleReset} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" /> Verify Another Recruiter
          </Button>
        </div>
      )}
    </div>
  );
}
