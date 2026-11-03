import Image from "next/image";
import Link from "next/link";

const PROMO_IMAGE = "/images/landing/promo-lanzamiento-50-off.jpg";

export function LaunchPromoBanner() {
  return (
    <div className="mt-12 sm:mt-14 lg:mt-16">
      <Link
        href="#catalogo"
        className="group block overflow-hidden rounded-2xl shadow-lg shadow-violet-500/15 ring-1 ring-violet-200/60 transition duration-200 hover:shadow-xl hover:shadow-violet-500/20 hover:ring-violet-300/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:rounded-[1.75rem]"
        aria-label="Ver productos con 50% off de lanzamiento"
      >
        <Image
          src={PROMO_IMAGE}
          alt="Lanzamiento SOSme: 50% off en todos los productos. QRs de mascota: 1 año premium y libreta sanitaria."
          width={1600}
          height={900}
          sizes="(max-width: 88rem) 100vw, 88rem"
          className="h-auto w-full transition duration-300 group-hover:scale-[1.01]"
          priority={false}
        />
      </Link>
    </div>
  );
}
