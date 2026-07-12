"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const TAGS = { div: motion.div, section: motion.section } as const;

export function FadeIn({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof typeof TAGS;
}) {
  const MotionTag = TAGS[as];

  return (
    <MotionTag
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
