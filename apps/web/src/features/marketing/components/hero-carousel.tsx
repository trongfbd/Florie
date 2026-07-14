"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_ROTATE_MS = 6000;

export function HeroCarousel({ images }: { images: { url: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [hasMultiple, images.length]);

  return (
    <>
      {images.map((image, i) => (
        <Image
          key={image.url}
          src={image.url}
          alt={image.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          } ${i === index ? "animate-hero-zoom" : ""}`}
        />
      ))}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)}
            aria-label="Banner trước"
            className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:flex"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => (current + 1) % images.length)}
            aria-label="Banner sau"
            className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:flex"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 gap-2">
            {images.map((image, i) => (
              <button
                key={image.url}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Xem banner ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
