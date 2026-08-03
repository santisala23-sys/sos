"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type ProductImageCarouselProps = {
  images: readonly string[];
  alt: string;
  intervalMs?: number;
};

export function ProductImageCarousel({
  images,
  alt,
  intervalMs = 3000,
}: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % images.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          aria-hidden={index !== activeIndex}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
          style={{
            objectPosition:
              src.includes("hero-golden-retriever") ? "50% 22%" : "center",
          }}
        />
      ))}
    </>
  );
}
