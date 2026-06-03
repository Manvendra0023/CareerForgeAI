"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Scan,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { analyzePhishingEmail } from "@/actions/resume";
import useFetch from "@/hooks/use-fetch";

const RISK_CONFIG = {
  HIGH: {
    label: "High Risk – Likely Scam",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    badge: "bg-red-500/20 text-red-400 border border-red-500/30",
    gaugeFill: "#ef4444",
    Icon: ShieldX,
    iconClass: "text-red-400",
    glowClass: "shadow-red-500/20",
  },
  MEDIUM: {
    label: "Medium Risk – Suspicious",
    bg: "bg-orange-500/10",
    border: "border-orange-500/40",
    badge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    gaugeFill: "#f97316",
    Icon: ShieldAlert,
    iconClass: "text-orange-400",
    glowClass: "shadow-orange-500/20",
  },
  LOW: {
    label: "Low Risk – Mostly Safe",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/40",
    badge: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    gaugeFill: "#eab308",
    Icon: Shield,
    iconClass: "text-yellow-400",
    glowClass: "shadow-yellow-500/20",
  },
  SAFE: {
    label: "Safe – Likely Legitimate",
    bg: "bg-green-500/10",
    border: "border-green-500/40",
    badge: "bg-green-500/20 text-green-400 border border-green-500/30",
    gaugeFill: "#22c55e",
    Icon: ShieldCheck,
    iconClass: "text-green-400",
    glowClass: "shadow-green-500/20",
  },
};

function RiskGauge({ score }) {
  const angle = (score / 100) * 180 - 90; // -90 to 90 degrees
  const radius = 70;
  const cx = 90;
  const cy = 80;

  // Arc for track and fill
  const arcPath = (startDeg, endDeg, r) => {
    const toRad = (d) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  const scoreAngle = -90 + (score / 100) * 180;
  const config =
    RISK_CONFIG[
      score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : score >= 20 ? "LOW" : "SAFE"
    ];

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Track arc */}
        <path
          d={arcPath(-90, 90, radius)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Color fill arc */}
        <path
          d={arcPath(-90, scoreAngle, radius)}
          fill="none"
          stroke={config.gaugeFill}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${config.gaugeFill}88)` }}
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + 55 * Math.cos(((scoreAngle - 90) * Math.PI) / 180)}
          y2={cy + 55 * Math.sin(((scoreAngle - 90) * Math.PI) / 180)}
          stroke={config.gaugeFill}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${config.gaugeFill})` }}
        />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="6" fill={config.gaugeFill} />
        {/* Score text */}
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill={config.gaugeFill}
        >
          {score}
        </text>
        <text x={cx} y={cy + 36} textAnchor="middle" fontSize="9" fill="#888">
          RISK SCORE
        </text>
      </svg>
    </div>
  );
}

export default function PhishingEmailAnalyzer() {
  const [emailContent, setEmailContent] = useState("");
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const {
    loading: isAnalyzing,
    fn: analyzeFn,
    data: analysisData,
    error: analysisError,
  } = useFetch(analyzePhishingEmail);

  // useFetch stores result in `data`, not the return value of fn()
  useEffect(() => {
    if (analysisData) {
      setResult(analysisData);
    }
  }, [analysisData]);

  useEffect(() => {
    if (analysisError) {
      toast.error(analysisError.message || "Analysis failed. Please try again.");
    }
  }, [analysisError]);

  const handleAnalyze = () => {
    if (!emailContent.trim() || emailContent.trim().length < 30) {
      toast.error("Please paste the full email content (at least 30 characters).");
      return;
    }
    analyzeFn({ emailContent });
  };

  const handleReset = () => {
    setEmailContent("");
    setResult(null);
  };

  const config = result ? RISK_CONFIG[result.riskLevel] || RISK_CONFIG.MEDIUM : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Mail className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Phishing Email Analyzer
            </h3>
            <p className="text-xs text-muted-foreground">
              Detect scam job offers with AI-powered analysis
            </p>
          </div>
        </div>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle Phishing Analyzer"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Collapsible body */}
      {expanded && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Input area */}
          {!result ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground/90">
                Paste the suspicious job offer email below
              </label>
              <Textarea
                id="phishing-email-input"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder={`Example:\nSubject: Exciting Remote Opportunity – $5,000/week!\nFrom: hr@jobs-hiring-now.net\n\nDear Applicant,\n\nWe found your resume online and would like to offer you a position...`}
                className="min-h-[180px] font-mono text-xs bg-background/60 border-border/60 resize-none focus:ring-purple-500/40"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {emailContent.length} characters
                </span>
                <Button
                  id="analyze-phishing-btn"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || emailContent.trim().length < 30}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4" />
                      Analyze Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Results panel */
            <div className="space-y-5">
              {/* Risk card header */}
              <div
                className={`rounded-xl border p-5 ${config.bg} ${config.border} shadow-lg ${config.glowClass}`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Gauge */}
                  <div className="shrink-0">
                    <RiskGauge score={result.riskScore} />
                  </div>

                  {/* Verdict info */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <config.Icon className={`h-6 w-6 ${config.iconClass}`} />
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${config.badge}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                      {result.verdict}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Red flags + Trust signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Red flags */}
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <h4 className="text-sm font-semibold text-red-400">
                      Red Flags ({result.redFlags?.length || 0})
                    </h4>
                  </div>
                  {result.redFlags?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {result.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                          <AlertTriangle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No red flags detected.
                    </p>
                  )}
                </div>

                {/* Trust signals */}
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <h4 className="text-sm font-semibold text-green-400">
                      Trust Signals ({result.trustSignals?.length || 0})
                    </h4>
                  </div>
                  {result.trustSignals?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {result.trustSignals.map((signal, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                          <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No trust signals found.
                    </p>
                  )}
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-1">
                      Recommendation
                    </h4>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {result.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analyze another */}
              <Button
                id="reset-phishing-btn"
                variant="outline"
                onClick={handleReset}
                className="w-full gap-2 border-border/60 hover:bg-muted/50"
              >
                <RotateCcw className="h-4 w-4" />
                Analyze Another Email
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
