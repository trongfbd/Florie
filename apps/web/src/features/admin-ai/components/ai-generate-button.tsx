"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAiStatus, useGenerateContent } from "../hooks";
import type { GenerateContentType } from "../types";

interface AiGenerateButtonProps {
  contentType: GenerateContentType;
  topic: string;
  onGenerated: (content: string) => void;
}

export function AiGenerateButton({ contentType, topic, onGenerated }: AiGenerateButtonProps) {
  const { data: status } = useAiStatus();
  const generateMutation = useGenerateContent();
  const [open, setOpen] = useState(false);
  const [keywords, setKeywords] = useState("");

  if (!status?.configured) return null;

  function handleGenerate() {
    generateMutation.mutate(
      { contentType, topic, keywords: keywords || undefined },
      { onSuccess: (result) => onGenerated(result.content) },
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full border-2 border-accent px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
      >
        <Sparkles size={14} />
        Sinh với AI
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-72 space-y-2 rounded-brand border-2 border-secondary bg-white p-3 shadow-xl">
          <p className="text-xs font-semibold text-heading">Chủ đề: {topic || "(chưa có tên/tiêu đề)"}</p>
          <input
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="Từ khoá nhấn mạnh (không bắt buộc)"
            className="w-full rounded-lg border-2 border-secondary px-2.5 py-1.5 text-xs outline-none focus:border-accent"
          />
          <button
            type="button"
            disabled={!topic || generateMutation.isPending}
            onClick={handleGenerate}
            className="w-full rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {generateMutation.isPending ? "Đang tạo..." : "Tạo nội dung"}
          </button>
          {generateMutation.isError && (
            <p className="text-xs text-destructive">Không tạo được nội dung — thử lại sau.</p>
          )}
        </div>
      )}
    </div>
  );
}
