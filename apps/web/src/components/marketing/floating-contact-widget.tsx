"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, ShoppingBag } from "lucide-react";
import { SiMessenger, SiZalo } from "react-icons/si";
import { contactConfig } from "@/lib/contact-config";
import { useCartCount } from "@/stores/cart-store";
import { CartDrawer } from "@/features/cart/components/cart-drawer";

const CONTACT_ACTIONS = [
  {
    key: "messenger",
    label: "Nhắn Messenger",
    href: contactConfig.messengerUrl,
    icon: SiMessenger,
    className: "bg-[#00B2FF]",
  },
  {
    key: "zalo",
    label: "Chat Zalo",
    href: contactConfig.zaloUrl,
    icon: SiZalo,
    className: "bg-[#0068FF]",
  },
  {
    key: "phone",
    label: "Gọi ngay",
    href: `tel:${contactConfig.phone}`,
    icon: Phone,
    className: "bg-success",
  },
] as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12, scale: 0.85 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function FloatingContactWidget() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = useCartCount();

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        <motion.button
          type="button"
          variants={ITEM_VARIANTS}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.25 }}
          onClick={() => setIsCartOpen(true)}
          className="group flex items-center gap-2"
        >
          <span className="whitespace-nowrap rounded-full bg-heading/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
            Giỏ hàng
          </span>
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform group-hover:scale-105">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </span>
        </motion.button>

        {CONTACT_ACTIONS.map((action, index) => (
          <motion.a
            key={action.key}
            href={action.href}
            target={action.href.startsWith("tel:") ? undefined : "_blank"}
            rel={action.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
            variants={ITEM_VARIANTS}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.25, delay: (index + 1) * 0.05 }}
            className="group flex items-center gap-2"
          >
            <span className="whitespace-nowrap rounded-full bg-heading/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
              {action.label}
            </span>
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-105 ${action.className}`}
            >
              <action.icon size={20} />
            </span>
          </motion.a>
        ))}
      </div>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
