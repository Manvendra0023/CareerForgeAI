"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert, ShieldCheck, ShieldX, Shield,
  Loader2, AlertTriangle, CheckCircle2, XCircle,
  Mail, Scan, RotateCcw, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { analyzePhishingEmail } from "@/actions/resume";
import useFetch from "@/hooks/use-fetch";

const RISK = {
  HIGH:   { label: "High Risk",     color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",    badge: "destructive", Icon: ShieldX },
  MEDIUM: { label: "Medium Risk",   color: "text-orange-400", bg: "bg-orange-500/10 border-orange-400/30", badge: "secondary",  Icon: ShieldAlert },
  LOW:    { label: "Low Risk",      color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-400/30", badge: "secondary",  Icon: Shield },
  SAFE:   { label: "Likely Safe",   color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30", badge: "secondary",  Icon: ShieldCheck },
};

export default function PhishingAnalyzerPage() {
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult] = useState(null);

  const { loading: isAnalyzing, fn: analyzeFn, data, error } = useFetch(analyzePhishingEmail);

  useEffect(() => { if (data) setResult(data); }, [data]);
  useEffect(() => { if (error) toast.error(error.message || "Analysis failed."); }, [error]);

  const handleAnalyze = () => {
    if (emailContent.trim().length < 30) { toast.error("Please paste the full email content."); return; }
    analyzeFn({ emailContent });
  };

  const cfg = result ? RISK[result.riskLevel] || RISK.MEDIUM : null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-purple-400" />
          <h1 className="text-2xl font-bold">Phishing Email Analyzer</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste a suspicious job offer email and AI will detect scam patterns instantly.
        </p>
      </div>

      {/* Input */}
      {!result ? (
        <div className="space-y-3">
          <Textarea
            id="phishing-page-email-input"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder={"Subject: Urgent Job Offer!\nFrom: hr@jobs-hiring-now.net\n\nDear Applicant, We found your resume..."}
            className="min-h-[200px] font-mono text-xs resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{emailContent.length} chars</span>
            <Button id="phishing-page-analyze-btn" onClick={handleAnalyze}
              disabled={isAnalyzing || emailContent.trim().length < 30}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
              {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing…</> : <><Scan className="h-4 w-4" />Analyze</>}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">

          {/* Score + Verdict */}
          <div className={`rounded-xl border p-5 space-y-3 ${cfg.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
                <span className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <span className={`text-3xl font-extrabold ${cfg.color}`}>{result.riskScore}<span className="text-sm font-normal text-muted-foreground">/100</span></span>
            </div>
            <p className="text-sm text-foreground/85">{result.verdict}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.explanation}</p>
          </div>

          {/* Red Flags */}
          {result.redFlags?.length > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">Red Flags</span>
              </div>
              <ul className="space-y-1.5">
                {result.redFlags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <ArrowRight className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust Signals */}
          {result.trustSignals?.length > 0 && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Trust Signals</span>
              </div>
              <ul className="space-y-1.5">
                {result.trustSignals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <ArrowRight className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          <div className="rounded-xl border border-border/50 bg-muted/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">WHAT TO DO</p>
            <p className="text-sm text-foreground/85">{result.recommendation}</p>
          </div>

          <Button id="phishing-page-reset-btn" variant="outline" onClick={() => { setResult(null); setEmailContent(""); }} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" /> Analyze Another Email
          </Button>
        </div>
      )}
    </div>
  );
}
