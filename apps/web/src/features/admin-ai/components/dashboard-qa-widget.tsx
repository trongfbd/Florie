"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAiStatus, useDashboardQa } from "../hooks";

interface QaEntry {
  question: string;
  answer: string;
}

export function DashboardQaWidget() {
  const { data: status } = useAiStatus();
  const qaMutation = useDashboardQa();
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QaEntry[]>([]);

  if (!status?.configured) return null;

  function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed) return;
    qaMutation.mutate(
      { message: trimmed },
      {
        onSuccess: (result) => {
          setHistory((prev) => [...prev, { question: trimmed, answer: result.reply }]);
          setQuestion("");
        },
      },
    );
  }

  return (
    <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
        <Sparkles size={18} className="text-accent" />
        Hỏi AI về dữ liệu kinh doanh
      </h2>

      {history.length > 0 && (
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg bg-secondary/20 p-3">
          {history.map((entry, index) => (
            <div key={index} className="space-y-1 text-sm">
              <p className="font-semibold text-heading">Bạn: {entry.question}</p>
              <p className="whitespace-pre-line text-foreground/80">{entry.answer}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAsk();
          }}
          placeholder="VD: Doanh thu tuần này thế nào?"
          className="flex-1 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={!question.trim() || qaMutation.isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
        >
          {qaMutation.isPending ? "Đang hỏi..." : "Hỏi"}
        </button>
      </div>
      {qaMutation.isError && <p className="text-xs text-destructive">Không lấy được câu trả lời — thử lại sau.</p>}
    </section>
  );
}
