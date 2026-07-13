"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAiStatus, useSalesAssistant } from "../hooks";

interface ChatEntry {
  question: string;
  answer: string;
}

export function SalesAssistantContent() {
  const { data: status, isLoading: statusLoading } = useAiStatus();
  const assistantMutation = useSalesAssistant();
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatEntry[]>([]);

  function handleSend() {
    const trimmed = message.trim();
    if (!trimmed) return;
    assistantMutation.mutate(
      { message: trimmed },
      {
        onSuccess: (result) => {
          setHistory((prev) => [...prev, { question: trimmed, answer: result.reply }]);
          setMessage("");
        },
      },
    );
  }

  if (statusLoading) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  if (!status?.configured) {
    return (
      <div className="rounded-brand border border-dashed border-secondary bg-secondary/20 p-8 text-center text-sm text-foreground/60">
        Tính năng AI chưa được cấu hình trên máy chủ (thiếu GEMINI_API_KEY).
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-foreground/60">
        Nhập yêu cầu của khách (dịp, ngân sách, sở thích...), AI sẽ gợi ý sản phẩm phù hợp từ danh mục đang bán.
      </p>

      <div className="min-h-[200px] space-y-4 rounded-brand border-2 border-secondary bg-white p-4">
        {history.length === 0 && (
          <p className="text-sm text-foreground/40">Chưa có cuộc trò chuyện nào.</p>
        )}
        {history.map((entry, index) => (
          <div key={index} className="space-y-1.5 text-sm">
            <p className="font-semibold text-heading">Nhân viên: {entry.question}</p>
            <div className="flex items-start gap-2 rounded-lg bg-secondary/30 p-3">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="whitespace-pre-line text-foreground/80">{entry.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSend();
          }}
          placeholder="VD: Khách muốn tặng hoa khai trương, tầm 500k"
          className="flex-1 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || assistantMutation.isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
        >
          {assistantMutation.isPending ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
      {assistantMutation.isError && (
        <p className="text-xs text-destructive">Không nhận được phản hồi — thử lại sau.</p>
      )}
    </div>
  );
}
