"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { FormInput, FormSelect, FormSlider } from "@/components/ui/FormInputs";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";


const STEPS = ["College & Course", "Costs", "Income & Savings", "Review"];

const COURSE_PRESETS: Record<string, number> = {
  "Computer Science (State)":         12000,
  "Computer Science (Private)":       45000,
  "Business Administration (State)":  10000,
  "Business Administration (Private)":38000,
  "Medicine (State)":                 25000,
  "Medicine (Private)":               55000,
  "Law (State)":                      18000,
  "Law (Private)":                    42000,
  "Engineering (State)":              14000,
  "Engineering (Private)":            40000,
  "Custom":                           0,
};

export default function SetupPage() {
  const router = useRouter();
  const { userData, setUserData } = useStore();

  const [step, setStep] = useState(0);
  const [course, setCourse] = useState(userData.course || "Computer Science (State)");
  const [useCustomTuition, setUseCustomTuition] = useState(false);

  const computedTuition = useCustomTuition ? userData.tuition : (COURSE_PRESETS[course] ?? 0);

  const handleCourseChange = (val: string) => {
    setCourse(val);
    if (val !== "Custom") {
      setUserData({ course: val, tuition: COURSE_PRESETS[val] });
      setUseCustomTuition(false);
    } else {
      setUserData({ course: val });
      setUseCustomTuition(true);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else {
      setUserData({ tuition: computedTuition });
      router.push("/snapshot");
    }
  };
  const back = () => setStep((s) => s - 1);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Plan Your Education</h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
          Answer a few quick questions to see your financial reality and loan risk.
        </p>
      </div>

      <div className="mb-12">
        <Stepper steps={STEPS} current={step} />
      </div>

      <Card className="shadow-2xl shadow-blue-500/5">
        <CardHeader className="bg-gray-50/50 py-8">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">
              {step + 1}
            </span>
            {STEPS[step]}
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 py-10">
          {step === 0 && (
            <div className="space-y-6">
              <FormSelect
                id="course-select"
                label="Course / Program"
                value={course}
                options={Object.keys(COURSE_PRESETS).map((k) => ({ value: k, label: k }))}
                onChange={(e) => handleCourseChange(e.target.value)}
              />
              {!useCustomTuition && course !== "Custom" && (
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl px-6 py-4 flex items-center justify-between group">
                  <div>
                    <p className="text-xs text-blue-600/60 font-bold uppercase tracking-widest mb-1">Estimated Tuition</p>
                    <p className="text-2xl font-black text-blue-800 tracking-tight">
                      ${COURSE_PRESETS[course]?.toLocaleString()}
                      <span className="text-sm font-bold text-blue-600/40 ml-1">/year</span>
                    </p>
                  </div>
                  <button
                    className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setUseCustomTuition(true)}
                  >
                    Adjust
                  </button>
                </div>
              )}
              {useCustomTuition && (
                <FormInput
                  id="tuition-input"
                  label="Annual Tuition ($)"
                  type="number"
                  min={0}
                  value={userData.tuition}
                  onChange={(e) => setUserData({ tuition: Number(e.target.value) })}
                  helpText="Enter the yearly tuition for your program."
                />
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <FormSelect
                id="living-style"
                label="Living Style"
                value={userData.livingStyle}
                onChange={(e) =>
                  setUserData({ livingStyle: e.target.value as "low" | "medium" | "high" })
                }
                options={[
                  { value: "low",    label: "Low  (~$10,000/yr)  – shared housing, cook at home" },
                  { value: "medium", label: "Medium (~$15,000/yr) – avg. apartment, normal spend" },
                  { value: "high",   label: "High  (~$25,000/yr) – own place, dining out, extras" },
                ]}
              />
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-medium leading-relaxed italic text-center">
                  "We calculate costs over 4 years. Miscellaneous (books, transport, etc.) is set at $5,000 total."
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10">
              <FormSlider
                label="Savings / Scholarships ($)"
                min={0}
                max={100000}
                step={500}
                value={userData.savings}
                onChange={(v) => setUserData({ savings: v })}
                format={(v) => `$${v.toLocaleString()}`}
              />
              <FormSlider
                label="Expected Starting Salary ($/yr)"
                min={20000}
                max={200000}
                step={1000}
                value={userData.expectedSalary}
                onChange={(v) => setUserData({ expectedSalary: v })}
                format={(v) => `$${v.toLocaleString()}`}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {[
                { label: "Program", val: course },
                { label: "Annual Tuition", val: `$${computedTuition.toLocaleString()}` },
                { label: "Living Style", val: userData.livingStyle, class: "capitalize" },
                { label: "Savings / Aid", val: `$${userData.savings.toLocaleString()}` },
                { label: "Expected Salary", val: `$${userData.expectedSalary.toLocaleString()}/yr` }
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-4 px-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">{row.label}</span>
                  <span className={cn("font-bold text-gray-900 tracking-tight", row.class)}>{row.val}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="px-8 pb-10 flex justify-between gap-4">
          <Button variant="secondary" onClick={back} disabled={step === 0} className="flex-1 lg:flex-none">
            Back
          </Button>
          <Button onClick={next} className="flex-[2] lg:flex-none lg:px-12 shadow-xl shadow-blue-500/20">
            {step === STEPS.length - 1 ? "See My Financial Reality →" : "Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
