import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ClipboardList,
  HeartPulse,
  MessageCircle,
  PawPrint,
  Phone,
  Stethoscope,
  Syringe,
} from "lucide-react";

export type ServiceSlug = "personas" | "mascotas";

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
  accentFrom: string;
  accentTo: string;
  featuresTitle: string;
  features: { icon: LucideIcon; title: string; text: string }[];
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
    heroHeadline: "Todo lo necesario cuando alguien necesita ayuda ya",
    heroSupport:
      "Un QR con contactos de emergencia, alergias, medicación e instrucciones. Ideal si se pierde un niño, un adulto mayor o una persona con discapacidad.",
    image: "/images/landing/viejita.jpeg",
    imageAlt:
      "Adulta mayor sonriendo con credencial y código QR SOSme colgando del cuello",
    heroImage: "/images/landing/viejita.jpeg",
    heroImageAlt:
      "Adulta mayor sonriendo con credencial y código QR SOSme colgando del cuello",
    accentFrom: "from-rose-600",
    accentTo: "to-orange-700",
    featuresTitle: "Lo que ve quien quiere ayudar",
    features: [
      {
        icon: Phone,
        title: "Contactos de emergencia",
        text: "Llamada o WhatsApp al tutor en segundos, sin instalar apps.",
      },
      {
        icon: HeartPulse,
        title: "Datos importantes",
        text: "Alergias, medicación, grupo sanguíneo e instrucciones claras.",
      },
      {
        icon: Bell,
        title: "Alerta al instante",
        text: "Vos recibís la notificación cuando escanean el QR, con ubicación opcional.",
      },
      {
        icon: MessageCircle,
        title: "Chat en vivo",
        text: "Coordiná con quien encontró a la persona sin perder el hilo.",
      },
    ],
    scenariosTitle: "Pensado para momentos reales",
    scenarios: [
      "Niños en salidas, colonia o viaje escolar",
      "Adultos mayores con orientación reducida",
      "Personas con discapacidad o condiciones de salud",
      "Quien necesita un respaldo visible en la calle",
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
    heroHeadline: "Si se pierde, te encuentran. Y su historial va con ella",
    heroSupport:
      "Chapita o collar con QR de emergencia, más libreta sanitaria digital: vacunas, visitas, indicaciones y acceso temporal para el veterinario.",
    image: "/images/landing/use-case-mascotas.jpg",
    imageAlt:
      "Golden retriever con collar y chapita SOSme con código QR en un parque",
    heroImage: "/images/landing/use-case-mascotas.jpg",
    heroImageAlt:
      "Golden retriever con collar y chapita SOSme con código QR en un parque",
    accentFrom: "from-teal-600",
    accentTo: "to-emerald-800",
    featuresTitle: "Doble protección: emergencia + libreta",
    features: [
      {
        icon: PawPrint,
        title: "Si se pierde, te contactan",
        text: "Quien encuentra a tu mascota ve cómo avisarte al toque.",
      },
      {
        icon: ClipboardList,
        title: "Libreta sanitaria digital",
        text: "Vacunas, desparasitaciones, visitas e indicaciones en un solo lugar.",
      },
      {
        icon: Stethoscope,
        title: "QR temporal para el veterinario",
        text: "Compartís acceso por 24 horas: ve el historial y carga la visita.",
      },
      {
        icon: Syringe,
        title: "Próximas dosis a la vista",
        text: "Sabés qué está aplicada y cuándo toca la próxima.",
      },
    ],
    scenariosTitle: "Para el día a día y la clínica",
    scenarios: [
      "Chapita o collar si se escapa o se pierde en un paseo",
      "Control de vacunas y desparasitaciones en casa",
      "Visita al vet con historial completo en el celular",
      "Indicaciones del profesional guardadas para el hogar",
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
    description: "Contacto de emergencia, alergias e instrucciones.",
    detail: "Niños, adultos mayores o personas con discapacidad.",
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
    description:
      "Si se pierde la encuentran y su libreta sanitaria va con ella.",
    detail: "Vacunas, visitas, indicaciones y QR temporal para el veterinario.",
    accent: "from-amber-500/20 to-yellow-500/10",
    image: SERVICES.mascotas.image,
    imageAlt: SERVICES.mascotas.imageAlt,
    images: USE_CASE_MASCOTAS_CARD_IMAGES,
    imageWidth: 686,
    imageHeight: 1024,
  },
] as const;
