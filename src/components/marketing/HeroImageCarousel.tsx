import Image from "next/image";

const HERO_IMAGE = {
  src: "/images/landing/hero-lanzamiento-promo.png",
  alt: "Promo lanzamiento SOSme: 50% off en productos. Cachorro con chapita QR; QRs de mascota con 1 año premium y libreta sanitaria.",
  width: 512,
  height: 512,
} as const;

export function HeroImageCarousel() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] sm:max-w-lg lg:max-w-none">
      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        width={HERO_IMAGE.width}
        height={HERO_IMAGE.height}
        priority
        unoptimized
        className="h-full w-full object-cover object-center"
        sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 560px"
      />
    </div>
  );
}
