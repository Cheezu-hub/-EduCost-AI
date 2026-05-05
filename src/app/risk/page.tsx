"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { InsightCard } from "@/components/ui/InsightCard";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/MetricCard";
import { fmt } from "@/lib/format";

export default function RiskPage() {
  const router = useRouter();
  const { userData, getCalculations } = useStore();
  const calc = getCalculations();

  const dti = calc.dtiRatio;
  const risk = calc.riskLevel as "Safe" | "Moderate" | "Risky";

  // Break-even: months until salary covers total loan cost
  const breakEvenMonths = calc.emi > 0
    ? Math.ceil(calc.loanRequired / (calc.emi * 0.5))
    : 0;

  const getRiskSummary = () => {
    if (risk === "Safe")
      return `Your EMI is ${dti.toFixed(1)}% of your monthly income — well within safe limits. You can manage this loan comfortably.`;
    if (risk === "Moderate")
      return `Your EMI is ${dti.toFixed(1)}% of your monthly income. This is manageable but leaves limited financial flexibility each month.`;
    return `Your EMI is ${dti.toFixed(1)}% of your monthly income — above the safe threshold of 30%. You are taking on significant financial risk.`;
  };

  const insights = [
    {
      title: "Debt-to-Income Ratio",
      body: `Your EMI (${fmt(calc.emi)}/mo) is ${dti.toFixed(1)}% of your expected monthly salary (${fmt(calc.monthlySalary)}/mo). Financial experts recommend keeping EMI below 15% of income for comfort. Above 30% creates serious repayment strain.`,
      variant: dti > 30 ? "warning" : dti > 15 ? "info" : "default",
    },
    {
      title: "Total Interest Paid (10 years)",
      body: `Over a 10-year repayment at the default rate, you will pay approximately ${fmt(calc.emi * 120 - calc.loanRequired)} in interest charges alone — on top of your principal loan of ${fmt(calc.loanRequired)}.`,
      variant: "info",
    },
    {
      title: "Break-Even Point",
      body: `You will need to sustain employment for roughly ${breakEvenMonths} months after graduation just to cover half the loan principal. Career disruption (job loss, gap) significantly extends this timeline.`,
      variant: dti > 15 ? "warning" : "default",
    },
    ...(risk === "Risky" ? [{
      title: "Why This Is Risky",
      body: `At ${dti.toFixed(1)}% DTI, a single missed paycheck or job loss could immediately put you in default risk. You would have less than ${fmt(calc.monthlySalary - calc.emi)}/month left for all other living expenses.`,
      variant: "warning" as const,
    }] : []),
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk &amp; Reality</h1>
        <p className="text-gray-500 text-sm mt-1">
          Is this education investment safe for your financial situation?
        </p>
      </div>

      {/* Risk Badge + Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Overall Risk Level</p>
            <RiskBadge level={risk} large />
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4">{getRiskSummary()}</p>
      </div>

      {/* Key metrics at a glance */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Monthly EMI" value={fmt(calc.emi)} sub="10-yr repayment" />
        <MetricCard label="DTI Ratio" value={`${dti.toFixed(1)}%`} sub="EMI / monthly income" highlight={dti > 15} />
        <MetricCard label="Remaining / Month" value={fmt(Math.max(0, calc.monthlySalary - calc.emi))} sub="after EMI deduction" />
      </div>

      {/* Insight Cards */}
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <InsightCard key={i} title={ins.title} body={ins.body} variant={ins.variant} />
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/snapshot")}>
          ← Snapshot
        </Button>
        <Button onClick={() => router.push("/simulation")}>
          Explore Scenarios →
        </Button>
      </div>
    </div>
  );
}
