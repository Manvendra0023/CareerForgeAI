"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldX, ShieldAlert, ShieldCheck, Shield,
  Loader2, AlertTriangle, CheckCircle2,
  Globe, RotateCcw, ArrowRight, Search, Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { checkUrlSafety } from "@/actions/security";
import useFetch from "@/hooks/use-fetch";

const RISK = {
  HIGH:   { label: "High Risk",   color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",       barColor: "bg-red-500",    Icon: ShieldX },
  MEDIUM: { label: "Medium Risk", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-400/30", barColor: "bg-orange-500", Icon: ShieldAlert },
  LOW:    { label: "Low Risk",    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-400/30", barColor: "bg-yellow-500", Icon: Shield },
  SAFE:   { label: "Safe URL",    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",   barColor: "bg-green-500",  Icon: ShieldCheck },
};

const STEPS = [
  "Validating URL format…",
  "Checking domain reputation…",
  "Scanning for phishing patterns…",
  "Analyzing risk factors…",
  "Generating safety report…",
];

export default function URLSafetyPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef(null);

  const { loading: isChecking, fn: checkFn, data, error } = useFetch(checkUrlSafety);

  useEffect(() => { if (data) setResult(data); }, [data]);
  useEffect(() => { if (error) toast.error(error.message || "Check failed."); }, [error]);

  // Animate progress bar while checking
  useEffect(() => {
    if (isChecking) {
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
  }, [isChecking, result]);

  const handleCheck = () => {
    let checkUrl = url.trim();
    if (!checkUrl) {
      toast.error("Please enter a URL to check.");
      return;
    }
    // Basic formatting to ensure it looks like a URL
    if (!/^https?:\/\//i.test(checkUrl)) {
      checkUrl = "http://" + checkUrl;
    }
    setResult(null);
    setProgress(0);
    checkFn({ url: checkUrl });
  };

  const cfg = result ? RISK[result.riskLevel] || RISK.MEDIUM : null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-400" />
          <h1 className="text-2xl font-bold">URL Safety Checker</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter a suspicious link to check for phishing, malware, and domain reputation risks.
        </p>
      </div>

      {/* Input */}
      {!result && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="url-safety-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                placeholder="example.com/login"
                disabled={isChecking}
                className="pl-9 w-full"
              />
            </div>
            <Button
              id="url-safety-check-btn"
              onClick={handleCheck}
              disabled={isChecking || !url.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shrink-0"
            >
              {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isChecking ? "Checking…" : "Check"}
            </Button>
          </div>

          {/* Progress bar */}
          {isChecking && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-200"
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
            <p className="text-xs text-green-400 text-right">Scan complete ✓</p>
          </div>

          {/* Risk summary */}
          <div className={`rounded-xl border p-5 space-y-2 ${cfg.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <cfg.Icon className={`h-5 w-5 ${cfg.color}`} />
                <span className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <span className={`text-3xl font-extrabold ${cfg.color}`}>
                {result.riskScore}<span className="text-sm font-normal text-muted-foreground">/100</span>
              </span>
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

          {/* Recommendation */}
          <div className="rounded-xl border border-border/50 bg-muted/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">RECOMMENDED ACTION</p>
            <p className="text-sm text-foreground/85">{result.recommendation}</p>
          </div>

          <Button variant="outline" onClick={() => { setResult(null); setUrl(""); setProgress(0); }} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" /> Check Another URL
          </Button>
        </div>
      )}
    </div>
  );
}
