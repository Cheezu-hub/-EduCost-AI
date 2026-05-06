"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";
import { aiApi, type ChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { fmt } from "@/lib/format";
import { Bot, User, Send, Trash2, Loader2 } from "lucide-react";

export default function AIChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { userData, getCalculations } = useStore();
  const calc = getCalculations();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load existing history on mount (if logged in)
  useEffect(() => {
    if (!user) return;
    aiApi.getHistory().then((history) => {
      if (Array.isArray(history) && history.length) setMessages(history);
    }).catch(() => {});
  }, [user]);

  const financialContext = {
    course: userData.course,
    totalCost: calc.totalCost,
    loanRequired: calc.loanRequired,
    emi: calc.emi,
    monthlySalary: calc.monthlySalary,
    dtiRatio: calc.dtiRatio,
    riskLevel: calc.riskLevel,
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setInput("");
    setError(null);
    const userMsg: ChatMessage = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const res = await aiApi.chat(msg, financialContext);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI service unavailable");
      setMessages((prev) => prev.slice(0, -1));
      setInput(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!user) return;
    await aiApi.clearHistory().catch(() => {});
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const STARTER_PROMPTS = [
    "What is a good debt-to-income ratio for a student loan?",
    "How can I reduce my total education cost?",
    "Explain my risk level in simple terms",
    "What scholarships should I look for?",
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Financial Advisor</h1>
        <p className="text-gray-500 mt-2 leading-relaxed">
          Ask anything about your education finances. The AI is aware of your current financial profile.
        </p>
      </div>

      {/* Financial context summary */}
      <div className="bg-blue-50/80 border border-blue-100 rounded-2xl px-5 py-4">
        <p className="text-xs font-bold text-blue-600/60 uppercase tracking-widest mb-2">Your current context</p>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-blue-800">
          <span>Program: <span className="font-black">{userData.course || "Not set"}</span></span>
          <span>Total Cost: <span className="font-black">{fmt(calc.totalCost)}</span></span>
          <span>Loan: <span className="font-black">{fmt(calc.loanRequired)}</span></span>
          <span>EMI: <span className="font-black">{fmt(calc.emi)}/mo</span></span>
          <span>DTI: <span className="font-black">{calc.dtiRatio.toFixed(1)}%</span></span>
          <span className={calc.riskLevel === "Safe" ? "text-emerald-700" : calc.riskLevel === "Moderate" ? "text-amber-700" : "text-rose-700"}>
            Risk: <span className="font-black">{calc.riskLevel}</span>
          </span>
        </div>
      </div>

      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-amber-800 font-semibold text-sm">
            🔒 Sign in to chat with the AI advisor and save your conversation history.
          </p>
          <Button size="sm" onClick={() => router.push("/login")} className="shrink-0">
            Sign In
          </Button>
        </div>
      )}

      {/* Chat window */}
      <Card className="shadow-xl shadow-blue-500/5 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">EduCost AI Advisor</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {messages.length > 0 && user && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-[420px] overflow-y-auto p-6 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Bot size={32} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Ask your financial AI</p>
                  <p className="text-sm text-gray-400 mt-1">
                    I know your loan details. Ask me anything.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setInput(p)}
                      className="text-left text-xs bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-gray-600 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 transition-all duration-200 font-medium"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600"
                }`}>
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Bot size={14} className="text-blue-600" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 size={16} className="text-blue-500 animate-spin" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-rose-500 text-xs text-center bg-rose-50 px-4 py-2 rounded-xl">
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4 flex gap-3 items-end">
            <textarea
              id="ai-chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={user ? "Ask about your finances… (Enter to send)" : "Sign in to chat…"}
              disabled={!user || isLoading}
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-50"
              style={{ minHeight: "46px", maxHeight: "140px" }}
            />
            <Button
              onClick={handleSend}
              disabled={!user || isLoading || !input.trim()}
              className="h-[46px] w-[46px] p-0 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0"
            >
              <Send size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
