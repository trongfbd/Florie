"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { SearchBox } from "./search-box";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({ categoryLinks, staticLinks }: { categoryLinks: NavLink[]; staticLinks: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const drawer = (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Đóng menu"
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/40"
      />
      <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-primary px-4 py-4">
          <span className="font-display text-lg font-bold text-accent">Menu</span>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-heading/50 hover:bg-secondary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-primary p-4">
          <SearchBox />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm font-semibold text-heading/80">
          {categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-primary hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-2 border-t border-secondary" />
          {staticLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-primary hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Mở menu"
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-heading/60 transition-colors hover:bg-primary hover:text-accent lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* isOpen only ever flips true from a browser click, well after
          hydration, so document is always defined here -- no SSR/hydration
          mismatch risk from skipping a mounted-check effect. */}
      {isOpen && createPortal(drawer, document.body)}
    </>
  );
}
