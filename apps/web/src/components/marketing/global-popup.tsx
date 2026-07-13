"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import type { Popup } from "@/features/marketing/types";

const SESSION_KEY = "florie-popup-shown";

const CONFETTI = [
  { left: "8%", top: "14%", size: 10, delay: 0, color: "bg-white/70" },
  { left: "88%", top: "10%", size: 8, delay: 0.4, color: "bg-primary" },
  { left: "16%", top: "78%", size: 7, delay: 0.8, color: "bg-primary" },
  { left: "80%", top: "72%", size: 12, delay: 0.2, color: "bg-white/60" },
  { left: "50%", top: "8%", size: 6, delay: 0.6, color: "bg-white/50" },
  { left: "92%", top: "42%", size: 9, delay: 1, color: "bg-primary" },
];

export function GlobalPopup({ popup }: { popup: Popup | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup) return;

    // Deferred via a microtask (rather than called synchronously in the effect body) per
    // this project's react-hooks/set-state-in-effect lint rule.
    Promise.resolve().then(() => {
      if (sessionStorage.getItem(SESSION_KEY) === popup.id) return;
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, popup.id);
    });
  }, [popup]);

  if (!popup) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24, rotate: -1.5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-brand shadow-2xl shadow-black/40"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:rotate-90 hover:bg-white/30"
            >
              <X size={16} />
            </button>

            <div className="relative overflow-hidden bg-gradient-to-br from-accent via-accent to-heading">
              {popup.imageUrl && (
                <Image
                  src={popup.imageUrl}
                  alt=""
                  fill
                  className="object-cover opacity-40 mix-blend-overlay"
                />
              )}

              {/* Confetti */}
              {CONFETTI.map((c, i) => (
                <motion.span
                  key={i}
                  className={`absolute rounded-full ${c.color}`}
                  style={{ left: c.left, top: c.top, width: c.size, height: c.size }}
                  animate={{ y: [0, -8, 0], opacity: [0.9, 0.5, 0.9] }}
                  transition={{ duration: 2.4, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}

              <div className="relative flex flex-col items-center gap-3 px-8 pb-8 pt-10 text-center">
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 shadow-inner"
                >
                  <Gift size={30} className="text-white" strokeWidth={1.75} />
                </motion.div>

                <h2 className="font-display text-2xl font-bold leading-tight text-white drop-shadow-sm">
                  {popup.title}
                </h2>

                {popup.content && (
                  <p className="max-w-xs text-sm leading-relaxed text-white/85">{popup.content}</p>
                )}

                {popup.linkUrl && (
                  <Link
                    href={popup.linkUrl}
                    onClick={() => setOpen(false)}
                    className="group mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-7 py-3 text-sm font-bold text-accent shadow-lg shadow-black/20 transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <Sparkles size={15} className="transition-transform group-hover:rotate-12" />
                    Xem ngay
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
