"use client";

import { motion } from "framer-motion";
import { ComboCard } from "./combo-card";
import type { Combo } from "../types";

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function ComboGrid({ combos }: { combos: Combo[] }) {
  if (combos.length === 0) {
    return (
      <div className="rounded-brand border border-dashed border-primary bg-secondary/40 p-12 text-center text-foreground/60">
        Hiện chưa có combo nào đang mở bán.
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={containerVariants}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {combos.map((combo) => (
        <motion.div key={combo.id} variants={itemVariants}>
          <ComboCard combo={combo} />
        </motion.div>
      ))}
    </motion.div>
  );
}
