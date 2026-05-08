"use client";

import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useStore, LIVING_COSTS } from "@/store/useStore";
import { FormSlider } from "@/components/ui/FormInputs";
import { MetricCard } from "@/components/ui/MetricCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { fmt } from "@/lib/format";
import { TrendingUp } from "lucide-react";


export default function SimulationPage() {
  const router = useRouter();
  const { simulationParams, setSimulationParams, getCalculations, userData } = useStore();

  // Base calculations (no simulation adjustments)
  const baseCalc = (() => {
    const living = LIVING_COSTS[userData.livingStyle];
    const totalCost = userData.tuition * 4 + living * 4 + 50000;
    const loan = Math.max(0, totalCost - userData.savings);
    const r = 0.055 / 12;
    const n = 120;
    const emi = loan > 0 ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
    const mSalary = userData.expectedSalary / 12;
    const dti = mSalary > 0 ? (emi / mSalary) * 100 : 0;
    const risk: "Safe" | "Moderate" | "Risky" = dti > 30 ? "Risky" : dti > 15 ? "Moderate" : "Safe";
    return { emi, dti, mSalary, risk, loan };
  })();

  // Scenario calculations
  const scenarioCalc = getCalculations();

  const chartData = [
    {
      name: "Monthly EMI",
      Base:     Math.round(baseCalc.emi),
      Scenario: Math.round(scenarioCalc.emi),
    },
    {
      name: "Monthly Salary",
      Base:     Math.round(baseCalc.mSalary),
      Scenario: Math.round(scenarioCalc.monthlySalary),
    },
    {
      name: "Remaining / Mo",
      Base:     Math.round(Math.max(0, baseCalc.mSalary - baseCalc.emi)),
      Scenario: Math.round(Math.max(0, scenarioCalc.monthlySalary - scenarioCalc.emi)),
    },
  ];

  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Scenario Simulator</h1>
        <p className="text-gray-500 text-lg mt-3 leading-relaxed">
          The future isn't fixed. Adjust the variables below to see how salary changes or interest rates impact your debt.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xl shadow-blue-500/5">
            <CardHeader className="py-6 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Adjust Variables</h2>
            </CardHeader>
            <CardContent className="space-y-10 py-10">
              <FormSlider
                label="Salary Change"
                min={-50}
                max={100}
                step={5}
                value={simulationParams.salaryChangePercent}
                onChange={(v) => setSimulationParams({ salaryChangePercent: v })}
                format={(v) => (v >= 0 ? `+${v}%` : `${v}%`)}
              />
              <FormSlider
                label="Interest Rate"
                min={2}
                max={15}
                step={0.25}
                value={simulationParams.interestRate}
                onChange={(v) => setSimulationParams({ interestRate: v })}
                format={(v) => `${v}%`}
              />
              <FormSlider
                label="Placement Delay"
                min={0}
                max={24}
                step={1}
                value={simulationParams.placementDelayMonths}
                onChange={(v) => setSimulationParams({ placementDelayMonths: v })}
                format={(v) => (v === 0 ? "No Delay" : `${v} months`)}
              />
            </CardContent>
          </Card>
          
          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-blue-800 font-bold text-sm">Did you know?</p>
              <p className="text-blue-700/70 text-xs leading-relaxed mt-1">
                A 1% increase in interest rate can add thousands to your total repayment over 10 years.
              </p>
            </div>
          </div>
        </div>

        {/* Live Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <MetricCard
              label="Projected EMI"
              value={fmt(scenarioCalc.emi)}
              sub={`vs base ${fmt(baseCalc.emi)}`}
              highlight={scenarioCalc.emi > baseCalc.emi}
              type="emi"
            />
            <MetricCard
              label="Projected Salary"
              value={fmt(scenarioCalc.monthlySalary)}
              sub={`vs base ${fmt(baseCalc.mSalary)}`}
              type="salary"
            />
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Visual Comparison</h2>
              <RiskBadge level={scenarioCalc.riskLevel} />
            </CardHeader>
            <CardContent className="py-10">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} barCategoryGap="25%" barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(v) => fmt(Number(v))} 
                  />
                  <Bar dataKey="Base"     fill="#e2e8f0" radius={[6,6,0,0]} />
                  <Bar dataKey="Scenario" fill="#2563eb" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between pt-10 border-t border-gray-100">
        <Button variant="ghost" onClick={() => router.push("/risk")} className="text-gray-400">
          ← Risk Analysis
        </Button>
        <Button size="lg" onClick={() => router.push("/decision")} className="px-10 shadow-xl shadow-blue-500/25">
          See Final Decision Guide →
        </Button>
      </div>
    </div>
  );
}
