"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck, ShieldAlert, ShieldX, Shield,
  Loader2, AlertTriangle, CheckCircle2,
  Scan, RotateCcw, ArrowRight, Zap, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { scanResumeForSecurity } from "@/actions/resume";
import useFetch from "@/hooks/use-fetch";

const RISK = {
  HIGH:   { label: "High Risk",   color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",      Icon: ShieldX },
  MEDIUM: { label: "Medium Risk", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-400/30", Icon: ShieldAlert },
  LOW:    { label: "Low Risk",    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-400/30", Icon: Shield },
  SAFE:   { label: "Safe",        color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",   Icon: ShieldCheck },
};

const SEV_DOT = { HIGH: "bg-red-400", MEDIUM: "bg-orange-400", LOW: "bg-yellow-400" };

export default function ResumeSecurityScanner({ resumeContent }) {
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const { loading: isScanning, fn: scanFn, data, error } = useFetch(scanResumeForSecurity);

  useEffect(() => { if (data) setResult(data); }, [data]);
  useEffect(() => { if (error) toast.error(error.message || "Scan failed."); }, [error]);

  const handleScan = () => {
    if (!resumeContent || resumeContent.trim().length < 50) {
      toast.error("Add some content to your resume first.");
      return;
    }
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
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(p => !p)}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Resume Security Scanner</p>
            <p className="text-xs text-muted-foreground">Detect privacy risks in your resume</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Pre-scan */}
          {!result && !isScanning && (
            <Button id="scan-resume-btn" onClick={handleScan}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
              <Scan className="h-4 w-4" /> Scan My Resume
            </Button>
          )}

          {/* Loading */}
          {isScanning && (
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
              <span className="text-sm">Scanning for privacy risks…</span>
            </div>
          )}

          {/* Results */}
          {result && !isScanning && (
            <div className="space-y-3">

              {/* Score */}
              <div className={`rounded-xl border p-4 space-y-2 ${cfg.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
                    <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-extrabold ${cfg.color}`}>{result.securityScore}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className="text-xs text-foreground/80">{result.summary}</p>
              </div>

              {/* Issues */}
              {sorted.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                    Issues Found ({sorted.length})
                  </p>
                  {sorted.map((risk, i) => (
                    <div key={i} className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${SEV_DOT[risk.severity] || "bg-gray-400"}`} />
                        <span className="text-xs font-semibold text-foreground/90">{risk.category}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{risk.severity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-3.5">{risk.issue}</p>
                      <div className="flex items-start gap-1 pl-3.5">
                        <Zap className="h-3 w-3 text-cyan-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-cyan-400">{risk.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Good practices */}
              {result.goodPractices?.length > 0 && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Doing Well
                  </p>
                  <ul className="space-y-1">
                    {result.goodPractices.map((gp, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/75">
                        <ArrowRight className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />{gp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Top fix */}
              {result.topRecommendation && (
                <div className="rounded-lg border border-border/50 bg-muted/40 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">TOP PRIORITY FIX</p>
                  <p className="text-xs text-foreground/85">{result.topRecommendation}</p>
                </div>
              )}

              <Button id="rescan-resume-btn" variant="outline" size="sm"
                onClick={() => setResult(null)}
                className="w-full gap-2 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Scan Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
