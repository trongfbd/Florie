"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Popup } from "@/features/marketing/types";

const SESSION_KEY = "florie-popup-shown";

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-brand border-2 border-secondary bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-heading shadow-md transition-transform hover:scale-110"
            >
              <X size={16} />
            </button>

            {popup.imageUrl && (
              <div className="relative h-48 w-full">
                <Image src={popup.imageUrl} alt={popup.title} fill className="object-cover" />
              </div>
            )}

            <div className="space-y-3 p-6">
              <h2 className="font-display text-xl font-bold text-heading">{popup.title}</h2>
              {popup.content && <p className="text-sm text-foreground/70">{popup.content}</p>}
              {popup.linkUrl && (
                <Link
                  href={popup.linkUrl}
                  onClick={() => setOpen(false)}
                  className="inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
                >
                  Xem ngay
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
