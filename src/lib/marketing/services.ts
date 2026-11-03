import type { LucideIcon } from "lucide-react";
import {
  Bell,
  HeartPulse,
  MessageCircle,
  PawPrint,
  Phone,
} from "lucide-react";

export type ServiceSlug = "personas" | "mascotas";

export type ServiceHeroSlide = {
  src: string;
  alt: string;
};

export type ServiceStep = {
  title: string;
  text: string;
};

export type ServiceShare = {
  eyebrow: string;
  title: string;
  text: string;
};

export type ServiceContent = {
  slug: ServiceSlug;
  href: string;
  navLabel: string;
  title: string;
  eyebrow: string;
  heroHeadline: string;
  heroSupport: string;
  image: string;
  imageAlt: string;
  heroImage: string;
  heroImageAlt: string;
  /** Si hay más de una, el hero rota entre ellas. */
  heroSlides?: readonly ServiceHeroSlide[];
  accentFrom: string;
  accentTo: string;
  /** Pasos del circuito, antes de los beneficios. */
  steps?: readonly ServiceStep[];
  featuresTitle: string;
  features: { icon: LucideIcon; title: string; text: string }[];
  /** Bloque de tutoría compartida (Plan Pro). */
  share?: ServiceShare;
  scenariosTitle: string;
  scenarios: string[];
  ctaTitle: string;
  ctaText: string;
};

export const SERVICES: Record<ServiceSlug, ServiceContent> = {
  personas: {
    slug: "personas",
    href: "/servicios/personas",
    navLabel: "Personas",
    title: "SOSme para personas",
    eyebrow: "Personas",
    heroHeadline: "La llevan puesta. Si pasa algo, te enterás vos.",
    heroSupport:
      "Armás el perfil de un niño, un adulto mayor, una persona con discapacidad o alguien que sale a la calle. Quien escanea ve a quién llamar y los datos importantes. Si comparte la ubicación exacta, te llega la notificación.",
    image: "/images/landing/viejita.jpeg",
    imageAlt:
      "Adulta mayor sonriendo con credencial y código QR SOSme colgando del cuello",
    heroImage: "/images/landing/viejita.jpeg",
    heroImageAlt:
      "Adulta mayor sonriendo con credencial y código QR SOSme colgando del cuello",
    heroSlides: [
      {
        src: "/images/landing/viejita.jpeg",
        alt: "Adulta mayor sonriendo con credencial y código QR SOSme colgando del cuello",
      },
      {
        src: "/images/landing/personas-moto-qr.jpeg",
        alt: "Persona en moto con código QR SOSme en el casco",
      },
    ],
    accentFrom: "from-rose-600",
    accentTo: "to-orange-700",
    steps: [
      {
        title: "Creás el perfil",
        text: "Nombre, a quién llamar, alergias, medicación e instrucciones. Vos quedás como responsable: en SOSme, el tutor.",
      },
      {
        title: "Lo lleva puesto",
        text: "En el cuello, la mochila, la credencial o el casco.",
      },
      {
        title: "Si comparten la ubicación, te llega",
        text: "La notificación sale cuando habilitan el GPS exacto. Igual pueden llamarte o escribirte por WhatsApp.",
      },
    ],
    featuresTitle: "Qué pasa cuando escanean",
    features: [
      {
        icon: Bell,
        title: "Te llega la alerta",
        text: "Cuando comparten la ubicación exacta.",
      },
      {
        icon: Phone,
        title: "Contacto al toque",
        text: "Pueden llamarte o escribirte por WhatsApp, sin instalar nada.",
      },
      {
        icon: HeartPulse,
        title: "Si no puede hablar",
        text: "Alergias, medicación, grupo sanguíneo e instrucciones ya están en el perfil.",
      },
      {
        icon: MessageCircle,
        title: "Chat en vivo",
        text: "Podés seguir la conversación con quien escaneó, sin perder el hilo.",
      },
    ],
    share: {
      eyebrow: "Plan Pro",
      title: "Compartí el perfil con quien también tiene que enterarse",
      text: "Con Plan Pro invitás a otra persona de la familia. Si comparten la ubicación exacta, la alerta les llega a los dos.",
    },
    scenariosTitle: "Pensado para momentos reales",
    scenarios: [
      "Niños en el colegio, la colonia o un viaje",
      "Adultos mayores que salen solos",
      "Personas con discapacidad o una condición que conviene tener a la mano",
      "En la moto o lejos de casa: el QR en el casco dice quién es y a quién avisar",
    ],
    ctaTitle: "Creá el perfil de quien más importa",
    ctaText:
      "En minutos tenés un QR listo para imprimir o activar en un producto físico.",
  },
  mascotas: {
    slug: "mascotas",
    href: "/servicios/mascotas",
    navLabel: "Mascotas",
    title: "SOSme para mascotas",
    eyebrow: "Mascotas",
    heroHeadline: "Si se pierde, te enterás vos.",
    heroSupport:
      "Quien escanea la chapita te contacta y, si comparte la ubicación exacta, te llega la notificación. La libreta no se abre con ese QR: vacunas y veterinario quedan en tu panel, con un acceso aparte para el veterinario de 24 horas.",
    image: "/images/landing/use-case-mascotas.jpg",
    imageAlt:
      "Golden retriever con collar y chapita SOSme con código QR en un parque",
    heroImage: "/images/landing/use-case-mascotas.jpg",
    heroImageAlt:
      "Golden retriever con collar y chapita SOSme con código QR en un parque",
    heroSlides: [
      {
        src: "/images/landing/use-case-mascotas.jpg",
        alt: "Golden retriever con collar y chapita SOSme con código QR en un parque",
      },
      {
        src: "/images/landing/perro2.jpeg",
        alt: "Perro con collar y chapita celeste SOSme en un parque",
      },
    ],
    accentFrom: "from-teal-600",
    accentTo: "to-emerald-800",
    steps: [
      {
        title: "Creás el perfil",
        text: "Foto, a quién llamar e instrucciones si la encuentran. Vos quedás como responsable: en SOSme, el tutor.",
      },
      {
        title: "El QR va en la chapita",
        text: "En el collar. Quien lo escanea no ve vacunas ni el historial del veterinario.",
      },
      {
        title: "Si comparten la ubicación, te llega",
        text: "La notificación sale cuando habilitan el GPS exacto. Igual pueden llamarte o escribirte por WhatsApp.",
      },
    ],
    featuresTitle: "Qué pasa cuando escanean la chapita",
    features: [
      {
        icon: Bell,
        title: "Te llega la alerta",
        text: "Cuando comparten la ubicación exacta.",
      },
      {
        icon: Phone,
        title: "Contacto al toque",
        text: "Pueden llamarte o escribirte por WhatsApp, sin instalar nada.",
      },
      {
        icon: PawPrint,
        title: "Solo lo necesario para encontrarla",
        text: "Ven el nombre, cómo acercarse y a quién avisar. La libreta no está en ese QR.",
      },
      {
        icon: MessageCircle,
        title: "Chat en vivo",
        text: "Podés seguir la conversación con quien la encontró, sin perder el hilo.",
      },
    ],
    share: {
      eyebrow: "Plan Pro",
      title: "Compartí el perfil con quien también tiene que enterarse",
      text: "Con Plan Pro invitás a otra persona de la familia. Si comparten la ubicación exacta, la alerta les llega a los dos.",
    },
    scenariosTitle: "Pensado para cuando no estás",
    scenarios: [
      "Si se escapa en un paseo o en la calle",
      "En la guardería, un viaje o la casa de alguien",
      "Cuando la encuentra una persona que no te conoce",
      "Si hay que avisar al toque y vos no estás ahí",
    ],
    ctaTitle: "Activá la libreta de tu mascota",
    ctaText:
      "Creá el perfil, cargá vacunas y compartí el acceso con el veterinario cuando haga falta.",
  },
};

export const SERVICE_LIST = Object.values(SERVICES);

/** Card Personas (home): rotación automática entre estas dos fotos. */
export const USE_CASE_PERSONAS_CARD_IMAGES = [
  "/images/landing/viejita.jpeg",
  "/images/landing/personas-moto-qr.jpeg",
] as const;

/** Card Mascotas (home): rotación automática. */
export const USE_CASE_MASCOTAS_CARD_IMAGES = [
  "/images/landing/use-case-mascotas.jpg",
  "/images/landing/perro2.jpeg",
] as const;

/** Cards del home (casos de uso). */
export const USE_CASE_CARDS = [
  {
    slug: "personas" as const,
    href: SERVICES.personas.href,
    title: "Personas",
    description: "La llevan puesta. Si pasa algo, te enterás vos.",
    detail:
      "Niños, adultos mayores, personas con discapacidad o el QR en el casco.",
    accent: "from-rose-500/20 to-orange-500/10",
    image: SERVICES.personas.image,
    imageAlt: SERVICES.personas.imageAlt,
    images: USE_CASE_PERSONAS_CARD_IMAGES,
    imageWidth: 1024,
    imageHeight: 687,
  },
  {
    slug: "mascotas" as const,
    href: SERVICES.mascotas.href,
    title: "Mascotas",
    description: "Si se pierde, te enterás vos.",
    detail: "Si comparten la ubicación, te llega el aviso. La libreta y el veterinario quedan aparte.",
    accent: "from-amber-500/20 to-yellow-500/10",
    image: SERVICES.mascotas.image,
    imageAlt: SERVICES.mascotas.imageAlt,
    images: USE_CASE_MASCOTAS_CARD_IMAGES,
    imageWidth: 686,
    imageHeight: 1024,
  },
] as const;
