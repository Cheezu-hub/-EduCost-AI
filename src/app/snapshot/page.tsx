"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useStore } from "@/store/useStore";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { fmt } from "@/lib/format";

const COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706"];

export default function SnapshotPage() {
  const router = useRouter();
  const { userData, simulationParams, getCalculations } = useStore();
  const calc = getCalculations();

  const chartData = [
    { name: "Tuition (4yr)",    value: calc.totalTuition },
    { name: "Living (4yr)",     value: calc.totalLiving },
    { name: "Miscellaneous",    value: calc.misc },
    { name: "Savings Covered",  value: Math.min(userData.savings, calc.totalCost) },
  ];

  const repaymentMonths = calc.emi > 0
    ? Math.ceil(calc.loanRequired / ((calc.emi) - (calc.loanRequired * simulationParams.interestRate / 100 / 12)))
    : 0;

  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Financial Reality</h1>
        <p className="text-gray-500 text-lg mt-3 leading-relaxed">
          We've broken down the costs for <strong>{userData.course || "your program"}</strong> over a 4-year period. Here's what your investment looks like.
        </p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Investment"
          value={fmt(calc.totalCost)}
          sub="4-year estimate"
          type="cost"
        />
        <MetricCard
          label="Loan Amount"
          value={fmt(calc.loanRequired)}
          sub="Post savings & aid"
          highlight
          type="loan"
        />
        <MetricCard
          label="Estimated EMI"
          value={fmt(calc.emi)}
          sub="10-yr repayment plan"
          type="emi"
        />
        <MetricCard
          label="Future Salary"
          value={fmt(calc.monthlySalary)}
          sub="Monthly take-home"
          type="salary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Where is the money going?</h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">A visual breakdown of your total education expense</p>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => fmt(v)} 
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
            <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">DTI Ratio</p>
            <h3 className="text-5xl font-black mb-4 tracking-tighter">
              {calc.dtiRatio.toFixed(1)}%
            </h3>
            <p className="text-blue-100/80 text-sm leading-relaxed font-medium">
              Debt-to-Income ratio represents the percentage of your gross monthly income that goes to paying your loan.
            </p>
          </div>
          
          <Card>
            <CardContent className="py-8">
              <h4 className="font-bold text-gray-900 mb-2">Did you know?</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Most financial advisors recommend keeping your education debt payments below <strong>15%</strong> of your gross monthly income to maintain a healthy lifestyle.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-900">
          ← Revise Inputs
        </Button>
        <Button size="lg" onClick={() => router.push("/risk")} className="shadow-xl shadow-blue-500/25 px-10">
          Analyze Financial Risk →
        </Button>
      </div>
    </div>
  );
}
