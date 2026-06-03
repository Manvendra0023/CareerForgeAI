"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck, ShieldAlert, ShieldX, Shield,
  Loader2, AlertTriangle, CheckCircle2,
  Lock, Scan, RotateCcw, ArrowRight, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { scanResumeForSecurity } from "@/actions/resume";
import useFetch from "@/hooks/use-fetch";

const RISK = {
  HIGH:   { label: "High Risk",   color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",      Icon: ShieldX },
  MEDIUM: { label: "Medium Risk", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-400/30", Icon: ShieldAlert },
  LOW:    { label: "Low Risk",    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-400/30", Icon: Shield },
  SAFE:   { label: "Safe",        color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",   Icon: ShieldCheck },
};

const SEV_DOT = {
  HIGH:   "bg-red-400",
  MEDIUM: "bg-orange-400",
  LOW:    "bg-yellow-400",
};

export default function ResumeSecurityPage() {
  const [resumeContent, setResumeContent] = useState("");
  const [result, setResult] = useState(null);

  const { loading: isScanning, fn: scanFn, data, error } = useFetch(scanResumeForSecurity);

  useEffect(() => { if (data) setResult(data); }, [data]);
  useEffect(() => { if (error) toast.error(error.message || "Scan failed."); }, [error]);

  const handleScan = () => {
    if (resumeContent.trim().length < 50) { toast.error("Please paste your resume content."); return; }
    setResult(null);
    scanFn({ resumeContent });
  };

  const cfg = result ? RISK[result.overallRisk] || RISK.MEDIUM : null;
  const sorted = result?.risks ? [
    ...result.risks.filter(r => r.severity === "HIGH"),
    ...result.risks.filter(r => r.severity === "MEDIUM"),
    ...result.risks.filter(r => r.severity === "LOW"),
  ] : [];

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-cyan-400" />
          <h1 className="text-2xl font-bold">Resume Security Scanner</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste your resume and AI will flag privacy risks and overshared personal data.
        </p>
      </div>

      {/* Input */}
      {!result && !isScanning && (
        <div className="space-y-3">
          <Textarea
            id="security-page-resume-input"
            value={resumeContent}
            onChange={(e) => setResumeContent(e.target.value)}
            placeholder={"John Doe\n123 Main Street, New York\njohn@gmail.com | DOB: 15 March 1995\n\nSKILLS\nReact, Node.js..."}
            className="min-h-[220px] font-mono text-xs resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{resumeContent.length} chars</span>
            <Button id="security-page-scan-btn" onClick={handleScan}
              disabled={resumeContent.trim().length < 50}
              className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
              <Scan className="h-4 w-4" />Scan Resume
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isScanning && (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Scanning for privacy risks…</p>
        </div>
      )}

      {/* Results */}
      {result && !isScanning && (
        <div className="space-y-4 animate-in fade-in duration-300">

          {/* Score + Summary */}
          <div className={`rounded-xl border p-5 space-y-3 ${cfg.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
                <span className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-extrabold ${cfg.color}`}>{result.securityScore}</span>
                <span className="text-sm font-normal text-muted-foreground">/100</span>
                <p className="text-[10px] text-muted-foreground">safety score</p>
              </div>
            </div>
            <p className="text-sm text-foreground/85">{result.summary}</p>
          </div>

          {/* Issues */}
          {sorted.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold">Issues Found ({sorted.length})</span>
              </div>
              <div className="space-y-2">
                {sorted.map((risk, i) => (
                  <div key={i} className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${SEV_DOT[risk.severity] || "bg-gray-400"}`} />
                      <span className="text-xs font-semibold text-foreground/90">{risk.category}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{risk.severity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-4">{risk.issue}</p>
                    <div className="flex items-start gap-1.5 pl-4">
                      <Zap className="h-3 w-3 text-cyan-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-cyan-400">{risk.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Good practices */}
          {result.goodPractices?.length > 0 && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">What You're Doing Well</span>
              </div>
              <ul className="space-y-1.5">
                {result.goodPractices.map((gp, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <ArrowRight className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />{gp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Top recommendation */}
          {result.topRecommendation && (
            <div className="rounded-xl border border-border/50 bg-muted/40 p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">TOP PRIORITY FIX</p>
              <p className="text-sm text-foreground/85">{result.topRecommendation}</p>
            </div>
          )}

          <Button id="security-page-reset-btn" variant="outline"
            onClick={() => { setResult(null); setResumeContent(""); }}
            className="w-full gap-2">
            <RotateCcw className="h-4 w-4" /> Scan Another Resume
          </Button>
        </div>
      )}
    </div>
  );
}
