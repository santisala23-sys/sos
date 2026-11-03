"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ServiceHeroSlide } from "@/lib/marketing/services";
import { cn } from "@/lib/utils/cn";

type ServiceHeroMediaProps = {
  slides: readonly ServiceHeroSlide[];
};

export function ServiceHeroMedia({ slides }: ServiceHeroMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <>
      {slides.map((slide, index) => {
        const active = index === activeIndex;
        return (
          <Image
            key={slide.src}
            src={slide.src}
            alt={active ? slide.alt : ""}
            fill
            priority={index === 0}
            aria-hidden={!active}
            className={cn(
              "object-cover transition-opacity duration-700 ease-in-out motion-reduce:transition-none",
              active ? "opacity-100" : "opacity-0",
            )}
            sizes="100vw"
          />
        );
      })}
    </>
  );
}
