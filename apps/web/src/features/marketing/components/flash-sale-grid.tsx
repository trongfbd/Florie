"use client";

import { motion } from "framer-motion";
import { FlashSaleItemCard } from "./flash-sale-item-card";
import type { FlashSaleItem } from "../types";

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function FlashSaleGrid({ items }: { items: FlashSaleItem[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={containerVariants}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={itemVariants}>
          <FlashSaleItemCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
