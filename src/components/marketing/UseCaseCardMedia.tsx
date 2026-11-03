"use client";

import Image from "next/image";
import { ProductImageCarousel } from "@/components/store/ProductImageCarousel";

type UseCaseCardMediaProps = {
  image: string;
  imageAlt: string;
  /** Si hay más de una, rotan automáticamente (p. ej. Personas). */
  images?: readonly string[];
};

export function UseCaseCardMedia({
  image,
  imageAlt,
  images,
}: UseCaseCardMediaProps) {
  const slides =
    images && images.length > 0 ? [...images] : [image];

  return (
    <div className="relative aspect-square w-full shrink-0 overflow-hidden">
      {slides.length > 1 ? (
        <ProductImageCarousel
          images={slides}
          alt={imageAlt}
          intervalMs={4500}
        />
      ) : (
        <Image
          src={slides[0]!}
          alt={imageAlt}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 90vw, 28rem"
        />
      )}
    </div>
  );
}
