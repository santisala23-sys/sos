import Image from "next/image";

const HERO_IMAGE = {
  src: "/images/landing/hero-puppy-sosme-tag.jpg",
  alt: "Persona sosteniendo a un cachorro golden retriever con chapita SOSme en el collar",
  objectPosition: "right 34%",
} as const;

export function HeroImageCarousel() {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[2rem] sm:max-w-lg lg:max-w-none lg:aspect-[4/5] lg:h-[36rem] lg:max-h-none">
      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        fill
        priority
        className="origin-right scale-[1.25] object-cover"
        style={{ objectPosition: HERO_IMAGE.objectPosition }}
        sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 50vw"
      />
    </div>
  );
}
