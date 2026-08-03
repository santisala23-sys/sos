"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const HERO_IMAGES = [
  {
    src: "/images/landing/hero-golden-retriever.jpg",
    alt: "Golden retriever con chapita SOSme en el collar en un jardín",
    objectPosition: "50% 22%",
  },
  {
    src: "/images/landing/hero-golden-retriever-2.jpg",
    alt: "Golden retriever sonriente con chapita QR SOSme en el collar",
    objectPosition: "50% 18%",
  },
] as const;

const INTERVAL_MS = 3000;

export function HeroImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % HERO_IMAGES.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative h-[26rem] w-full overflow-hidden rounded-[1.5rem] sm:h-[30rem] lg:h-[34rem]">
      {HERO_IMAGES.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          aria-hidden={index !== activeIndex}
          className={`object-cover object-center transition-opacity duration-700 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: image.objectPosition }}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      ))}
    </div>
  );
}
