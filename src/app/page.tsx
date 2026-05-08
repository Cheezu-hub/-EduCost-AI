"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { FormInput, FormSelect, FormSlider } from "@/components/ui/FormInputs";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";



const STEPS = ["College & Course", "Costs", "Income & Savings", "Review"];

const COURSE_PRESETS: Record<string, number> = {
  "Engineering (State)":              150000,
  "Engineering (Private)":            450000,
  "Medical (MBBS)":                   800000,
  "Business (MBA)":                   600000,
  "Arts / Science (State)":           50000,
  "Arts / Science (Private)":         150000,
  "Law (LLB)":                        250000,
  "Custom":                           0,
};

export default function SetupPage() {
  const router = useRouter();
  const { userData, setUserData } = useStore();

  const [step, setStep] = useState(0);
  const [course, setCourse] = useState(userData.course || "Engineering (State)");
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
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Plan Your <span className="gradient-text">Education</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
          See your financial reality and loan risk. <span className="text-cyan-400 font-bold">No account needed to start.</span>
        </p>
      </motion.div>

      <div className="mb-12">
        <Stepper steps={STEPS} current={step} />
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bento-card overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 py-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-400 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-cyan-500/20">
                {step + 1}
              </span>
              {STEPS[step]}
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 py-10 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-xs text-cyan-400/80 font-bold uppercase tracking-widest mb-1">Estimated Tuition</p>
                    <p className="text-2xl font-black text-white tracking-tight">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(COURSE_PRESETS[course])}
                      <span className="text-sm font-bold text-white/40 ml-1">/year</span>
                    </p>
                  </div>
                  <button
                    className="text-xs font-bold bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all active:scale-95"
                    onClick={() => setUseCustomTuition(true)}
                  >
                    Adjust
                  </button>
                </div>
              )}
              {useCustomTuition && (
                <FormInput
                  id="tuition-input"
                  label="Annual Tuition (₹)"
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
                  { value: "low",    label: "Low  (~₹1,20,000/yr) – shared PG, local transport" },
                  { value: "medium", label: "Medium (~₹2,40,000/yr) – decent room, normal spend" },
                  { value: "high",   label: "High  (~₹4,80,000/yr) – private flat, lifestyle extras" },
                ]}
              />
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-gray-400 font-medium leading-relaxed italic text-center">
                  "We calculate costs over 4 years. Miscellaneous (books, transport, etc.) is set at ₹50,000 total."
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10">
              <FormSlider
                label="Savings / Scholarships (₹)"
                min={0}
                max={2000000}
                step={10000}
                value={userData.savings}
                onChange={(v) => setUserData({ savings: v })}
                format={(v) => `₹${v.toLocaleString('en-IN')}`}
              />
              <FormSlider
                label="Expected Starting Salary (₹/yr)"
                min={200000}
                max={5000000}
                step={50000}
                value={userData.expectedSalary}
                onChange={(v) => setUserData({ expectedSalary: v })}
                format={(v) => `₹${v.toLocaleString('en-IN')}`}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {[
                { label: "Program", val: course },
                { label: "Annual Tuition", val: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(computedTuition) },
                { label: "Living Style", val: userData.livingStyle, class: "capitalize" },
                { label: "Savings / Aid", val: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(userData.savings) },
                { label: "Expected Salary", val: `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(userData.expectedSalary)}/yr` }
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-4 px-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">{row.label}</span>
                  <span className={cn("font-bold text-white tracking-tight", row.class)}>{row.val}</span>
                </div>
              ))}
            </div>
          )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <div className="px-8 pb-10 flex justify-between gap-4">
            <Button variant="secondary" onClick={back} disabled={step === 0} className="flex-1 lg:flex-none">
              Back
            </Button>
            <Button onClick={next} className="flex-[2] lg:flex-none lg:px-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all active:scale-95">
              {step === STEPS.length - 1 ? "See My Financial Reality →" : "Continue"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
