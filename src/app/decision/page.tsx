"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ComparisonTable } from "@/components/ui/ComparisonTable";
import { InsightCard } from "@/components/ui/InsightCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";


const ALTERNATIVES = [
  {
    name: "Distance Learning / IGNOU",
    tuitionYearly: 10000,
    description: "Highly affordable distance programs for foundational courses",
  },
  {
    name: "State Government College",
    tuitionYearly: 40000,
    description: "Quality education with significant state subsidies",
  },
  {
    name: "In-State Private College",
    tuitionYearly: 150000,
    description: "Attend locally to eliminate high residency and travel costs",
  },
];

function calcAlternative(tuitionYearly: number, savings: number, salary: number) {
  const totalCost = tuitionYearly * 4 + 240000 * 4 + 50000; // medium living (2.4L/yr) + 50k misc
  const loan = Math.max(0, totalCost - savings);
  const r = 0.055 / 12;
  const n = 120;
  const emi = loan > 0 ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
  const mSalary = salary / 12;
  const dti = mSalary > 0 ? (emi / mSalary) * 100 : 0;
  const risk: "Safe" | "Moderate" | "Risky" = dti > 30 ? "Risky" : dti > 15 ? "Moderate" : "Safe";
  return { totalCost, loan, emi, dti, risk };
}

export default function DecisionPage() {
  const router = useRouter();
  const { userData, getCalculations, saveReport, isSaving, lastSavedAt } = useStore();
  const { user } = useAuthStore();
  const calc = getCalculations();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleExport = async () => {
    if (user) {
      setSaveStatus('saving');
      try {
        await saveReport(`${userData.course || 'Education'} Financial Report`);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } else {
      window.print();
    }
  };

  const alts = ALTERNATIVES.map((a) => ({
    ...a,
    ...calcAlternative(a.tuitionYearly, userData.savings, userData.expectedSalary),
  }));

  // Best alternative
  const best = [...alts].sort((a, b) => a.dti - b.dti)[0];
  const riskReduction =
    calc.dtiRatio > 0
      ? Math.round(((calc.dtiRatio - best.dti) / calc.dtiRatio) * 100)
      : 0;

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Decision &amp; Alternatives</h1>
        <p className="text-gray-500 text-lg mt-3 leading-relaxed">
          Compare your current path with smarter alternatives. Small changes now can lead to massive financial freedom later.
        </p>
      </div>

      {/* Final Insight Card */}
      <div
        className={cn(
          "rounded-3xl p-8 border-2 transition-all duration-500 shadow-xl",
          calc.riskLevel === "Safe"
            ? "bg-emerald-50 border-emerald-100 shadow-emerald-500/5"
            : calc.riskLevel === "Moderate"
            ? "bg-amber-50 border-amber-100 shadow-amber-500/5"
            : "bg-rose-50 border-rose-100 shadow-rose-500/5"
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Your Current Strategy</p>
            <div className="flex items-center gap-3">
              <RiskBadge level={calc.riskLevel as "Safe" | "Moderate" | "Risky"} large />
              <span className="text-2xl font-black text-gray-900">
                {calc.dtiRatio.toFixed(1)}% <span className="text-sm font-medium text-gray-400">DTI</span>
              </span>
            </div>
          </div>
          
          <div className="max-w-md">
            {riskReduction > 0 ? (
              <p className="text-gray-700 font-medium leading-relaxed">
                By switching to <strong>{best.name}</strong>, you could reduce your financial risk by{" "}
                <span className="text-emerald-600 font-black">{riskReduction}%</span>.
              </p>
            ) : (
              <p className="text-gray-700 font-medium leading-relaxed">
                Your current plan is exceptionally solid. You are on a clear, low-risk path to graduation.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight text-center md:text-left">Better Paths to Explore</h2>
          <div className="hidden md:block h-px flex-1 bg-gray-100 mx-8" />
        </div>
        
        <div className="grid gap-8">
          {alts.map((alt) => (
            <Card key={alt.name} className="hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
                <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-tight">{alt.name}</h3>
                  <p className="text-sm text-gray-400 font-medium">{alt.description}</p>
                </div>
                <RiskBadge level={alt.risk} />
              </CardHeader>
              <CardContent className="pb-8">
                <ComparisonTable
                  rows={[
                    {
                      label: "Total Investment",
                      base: fmt(calc.totalCost),
                      alternative: fmt(alt.totalCost),
                      better: alt.totalCost < calc.totalCost ? "alternative" : "base",
                    },
                    {
                      label: "Loan Needed",
                      base: fmt(calc.loanRequired),
                      alternative: fmt(alt.loan),
                      better: alt.loan < calc.loanRequired ? "alternative" : "base",
                    },
                    {
                      label: "Monthly EMI",
                      base: fmt(calc.emi),
                      alternative: fmt(alt.emi),
                      better: alt.emi < calc.emi ? "alternative" : "base",
                    },
                    {
                      label: "DTI Ratio",
                      base: `${calc.dtiRatio.toFixed(1)}%`,
                      alternative: `${alt.dti.toFixed(1)}%`,
                      better: alt.dti < calc.dtiRatio ? "alternative" : "base",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InsightCard
          title="Debt is a Weight"
          body="Every ₹1,00,000 less in loans saves you roughly ₹15,000 in interest per year. That's a month's salary or a head start on an emergency fund."
          variant="info"
        />
        <InsightCard
          title="Free Money First"
          body="Scholarships are your best friend. Even a ₹50,000 grant reduces your loan principal and compounds your savings over time."
          variant="default"
        />
        {calc.riskLevel === "Risky" && (
          <InsightCard
            title="Warning Signal"
            body="Your current DTI is high. Consider a co-signer or a part-time job during school to keep the loan principal low."
            variant="warning"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
        <Button onClick={() => router.push("/")} variant="ghost" className="w-full sm:w-auto">
          ← Start Over
        </Button>
        <div className="flex-1" />
        <Button onClick={() => router.push("/simulation")} variant="secondary" className="w-full sm:w-auto px-8">
          Refine Scenarios
        </Button>
        <Button
          onClick={handleExport}
          disabled={saveStatus === 'saving'}
          className="w-full sm:w-auto px-10 shadow-xl shadow-blue-500/20"
        >
          {saveStatus === 'saving' ? 'Saving…' :
           saveStatus === 'saved' ? '✓ Report Saved!' :
           saveStatus === 'error' ? 'Save Failed' :
           user ? 'Save Report →' : 'Export (Print)'}
        </Button>
      </div>
    </div>
  );
}
