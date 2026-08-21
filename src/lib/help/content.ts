export type HelpFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type HelpManualSubsection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type HelpManualChapter = {
  id: string;
  title: string;
  summary: string;
  subsections: HelpManualSubsection[];
};

export const HELP_FAQ: HelpFaqItem[] = [
  {
    id: "faq-qr-emergencia-vs-vet",
    question: "¿El QR del veterinario es el mismo que el de emergencias?",
    answer:
      "No. Son cosas completamente distintas. El QR de emergencia es el que imprimís o pegás en la chapita: cualquiera puede escanearlo para avisarte en una urgencia. El QR para veterinario lo generás desde la libreta sanitaria cuando vas al vet: dura 24 horas y solo permite cargar una visita. No sirve para emergencias ni para entrar a tu panel.",
  },
  {
    id: "faq-libreta-acceso",
    question: "¿Cómo entro a la libreta sanitaria de mi mascota?",
    answer:
      "Ingresá a sosme.com.ar con tu cuenta → Panel → sección Mascotas → elegí la mascota → Abrir libreta sanitaria. La libreta no se abre escaneando el QR físico de la chapita.",
  },
  {
    id: "faq-sin-app",
    question: "¿Necesito instalar una app?",
    answer:
      "No. SOSme funciona en el navegador del celular o la computadora. Vos gestionás todo desde el panel web. Quien escanea tu QR también lo hace desde el navegador, sin registrarse.",
  },
  {
    id: "faq-alertas",
    question: "¿Cuándo recibo una alerta?",
    answer:
      "Cuando alguien escanea tu QR de emergencia y abre el perfil público. También recibís aviso si presionan el botón SOS o si un veterinario carga una visita en la libreta. Activá las notificaciones push desde el panel para enterarte al instante.",
  },
  {
    id: "faq-perfiles-tipos",
    question: "¿Qué diferencia hay entre Personas, Mascotas y Objetos?",
    answer:
      "Son tres secciones del mismo panel, cada una con perfiles QR de emergencia adaptados al caso. Personas muestra en emergencia datos de salud en texto (tipo de sangre, alergias, condiciones/medicación, obra social) y SOS. Mascotas suma libreta sanitaria, QR temporal para el vet y PDF clínico opcional en el perfil público. Objetos permite que quien encuentre el bien guarde ubicación y te contacte.",
  },
  {
    id: "faq-persona-sin-pdf",
    question: "¿Puedo subir un PDF clínico en un perfil de Persona?",
    answer:
      "No. En Personas los datos de salud van solo en texto (tipo de sangre, alergias, condiciones/medicación y obra social/prepaga) para que quien asista los lea al instante, sin descargar archivos. El PDF clínico opcional está disponible solo en perfiles de Mascota.",
  },
  {
    id: "faq-obra-social",
    question: "¿Dónde cargo la obra social o prepaga?",
    answer:
      "En un perfil de Persona: Panel → Personas → Editar perfil → sección Datos de salud → campo «Obra social / prepaga y N° de socio». Quien escanee el QR lo verá en la página de emergencia.",
  },
  {
    id: "faq-activar-producto",
    question: "Compré una chapita o collar, ¿cómo la activo?",
    answer:
      "En el panel, expandí el bloque «Hola, este es tu panel» y tocá Activar mi producto. Escaneá el QR del producto o ingresá el código manual. Completá los datos del perfil y quedará vinculado a tu cuenta, sin costo de mantenimiento.",
  },
  {
    id: "faq-qr-descargar",
    question: "¿Cómo descargo o imprimo mi QR?",
    answer:
      "En la tarjeta del perfil, tocá Ver QR. Ahí podés descargar PNG o PDF. Ese QR apunta siempre al perfil público de emergencia.",
  },
  {
    id: "faq-perfil-inactivo",
    question: "¿Qué pasa si desactivo un perfil?",
    answer:
      "El perfil queda marcado como Inactivo. Quien escanee el QR verá que el perfil no está disponible. Podés reactivarlo editando el perfil y volviendo a activarlo.",
  },
  {
    id: "faq-vet-expira",
    question: "¿Cuánto dura el enlace para el veterinario?",
    answer:
      "24 horas desde que lo generás. Después expira y el vet ya no puede cargar visitas con ese enlace. Podés generar uno nuevo cuando lo necesites desde la libreta.",
  },
  {
    id: "faq-mas-perfiles",
    question: "¿Puedo tener más de un perfil?",
    answer:
      "Sí, según tu plan. Si llegaste al límite, el panel te avisa y podés contactarnos para ampliar la cuenta desde la página de contacto.",
  },
  {
    id: "faq-cambiar-nombre-tipo",
    question: "¿Puedo cambiar el nombre o el tipo de un QR después de crearlo?",
    answer:
      "No desde el panel: podés editar contactos, instrucciones y el resto de la información, pero no el nombre ni el tipo (Persona, Mascota u Objeto). Si te equivocaste al crearlos, escribinos por los canales de contacto indicando la razón del cambio y a qué valor querés pasar el nombre o el tipo.",
  },
];

export const HELP_MANUAL: HelpManualChapter[] = [
  {
    id: "introduccion",
    title: "1. Introducción",
    summary: "Qué es SOSme para vos como tutor y qué vas a encontrar en el panel.",
    subsections: [
      {
        id: "intro-que-es",
        title: "Qué es SOSme",
        paragraphs: [
          "SOSme vincula un código QR a un perfil de emergencia. Cuando alguien lo escanea, ve cómo contactarte y vos recibís una alerta.",
          "Como tutor tenés un panel privado en sosme.com.ar donde configurás perfiles, descargás QRs, revisás alertas y —si tenés mascotas— gestionás la libreta sanitaria.",
        ],
      },
      {
        id: "intro-tres-qr",
        title: "Los tres QRs que debés conocer",
        paragraphs: [
          "Confundir estos accesos es el error más común. Cada uno tiene un propósito distinto:",
        ],
        bullets: [
          "QR de emergencia (permanente): va en la chapita/collar/sticker. Lo escanea cualquier persona en una urgencia.",
          "QR de activación de producto (una sola vez): viene en el producto físico que compraste. Solo sirve para vincular ese QR a tu cuenta al activarlo.",
          "QR/enlace para veterinario (temporal, 24 h): se genera desde la libreta sanitaria. Solo el profesional lo usa para cargar una visita.",
        ],
      },
    ],
  },
  {
    id: "acceso-panel",
    title: "2. Cómo entrar al panel",
    summary: "Pasos para iniciar sesión y llegar a tu panel de tutor.",
    subsections: [
      {
        id: "acceso-login",
        title: "Iniciar sesión",
        paragraphs: [
          "Entrá a sosme.com.ar y tocá Iniciar sesión (arriba a la derecha) o Crear cuenta si todavía no tenés usuario.",
          "Una vez dentro, el menú te lleva a Panel. Esa es tu pantalla principal de tutor.",
        ],
      },
      {
        id: "acceso-navegacion",
        title: "Menú superior del panel",
        paragraphs: [
          "En computadora y celular vas a ver estas opciones principales:",
        ],
        bullets: [
          "Panel: pantalla principal con tus perfiles agrupados por tipo.",
          "Actividad: historial de escaneos, alertas SOS y chat con quien escaneó.",
          "Perfil: datos de tu cuenta, exportar información y solicitar baja.",
          "Tienda: catálogo de productos físicos SOSme.",
          "Ayuda: este centro de preguntas frecuentes y manual.",
        ],
      },
    ],
  },
  {
    id: "estructura-panel",
    title: "3. Estructura del panel principal",
    summary: "Qué significa cada bloque de la pantalla /dashboard.",
    subsections: [
      {
        id: "panel-hero",
        title: "Bloque «Hola, este es tu panel»",
        paragraphs: [
          "Es el recuadro violeta superior. Tocalo para expandirlo y ver un resumen rápido.",
        ],
        bullets: [
          "QRs activos: cuántos perfiles tenés activos respecto a tu plan.",
          "Alertas: cuántos eventos de escaneo o SOS tenés sin leer.",
          "Activar mi producto: abre el escáner para vincular una chapita o collar comprado.",
        ],
      },
      {
        id: "panel-notificaciones",
        title: "Alertas y notificaciones push",
        paragraphs: [
          "Si hay alertas sin leer, aparece un banner destacado que te lleva directo al último evento.",
          "Más abajo podés activar las notificaciones push del navegador. Recomendamos hacerlo para enterarte al instante cuando escanean un QR o cargan una visita veterinaria.",
          "En iPhone, puede que necesites agregar SOSme a la pantalla de inicio para que las push funcionen bien.",
        ],
      },
      {
        id: "panel-secciones",
        title: "Secciones Personas, Objetos y Mascotas",
        paragraphs: [
          "El panel está dividido en tres bloques colapsables. Cada uno agrupa perfiles del mismo tipo:",
        ],
        bullets: [
          "Personas (rosa): familiares o vos mismo. Contactos, datos de salud en texto (sangre, alergias, medicación, obra social) y SOS.",
          "Objetos (celeste): valijas, autos, equipos. Contacto del dueño + opción de guardar ubicación.",
          "Mascotas (verde): libreta sanitaria + QR de emergencia (contacto del dueño y PDF clínico opcional) para si se pierde.",
        ],
      },
      {
        id: "panel-vacio",
        title: "Secciones vacías",
        paragraphs: [
          "Personas y Objetos se ocultan si no tenés perfiles creados. Mascotas siempre aparece, aunque esté vacía, para que sepas dónde crear o activar una mascota.",
          "En cada sección vacía hay un botón Agregar persona / Agregar objeto / Agregar mascota.",
        ],
      },
    ],
  },
  {
    id: "qr-emergencia",
    title: "4. QR de emergencia",
    summary: "Cómo funciona el QR permanente que va en la chapita o sticker.",
    subsections: [
      {
        id: "qr-que-es",
        title: "Qué es y qué NO es",
        paragraphs: [
          "El QR de emergencia es único por perfil y apunta a una página pública (por ejemplo sosme.com.ar/p/tu-perfil).",
          "No abre la libreta sanitaria. No entra al panel del tutor. No es el QR temporal del veterinario.",
        ],
      },
      {
        id: "qr-crear",
        title: "Crear un perfil y generar el QR",
        paragraphs: [
          "Desde la sección correspondiente, tocá Agregar persona, Agregar objeto o Agregar mascota.",
          "Completá el formulario con foto, contactos e instrucciones. En Personas sumá datos de salud en texto; en Mascotas podés subir un PDF clínico después de crear el perfil.",
          "Al guardar, volvés al panel. En la tarjeta del perfil, tocá Ver QR para verlo, descargar PNG o imprimir PDF.",
        ],
      },
      {
        id: "qr-publico",
        title: "Qué ve quien escanea",
        paragraphs: [
          "La persona que escanea ve una página de ayuda con:",
        ],
        bullets: [
          "Foto y nombre del beneficiario (persona, mascota u objeto).",
          "Botones para llamar o escribir por WhatsApp a los contactos de emergencia (el número no se muestra en texto plano).",
          "En Personas: tipo de sangre, alergias, condiciones/medicación y obra social, si los cargaste.",
          "En Mascotas: contacto del dueño e instrucciones; PDF clínico opcional si lo subiste.",
          "En Objetos: opción de guardar ubicación del hallazgo.",
          "Opción de compartir ubicación del escaneo (si acepta).",
          "Botón SOS / Necesito ayuda en perfiles de persona.",
          "Chat en vivo para coordinar con la familia.",
        ],
      },
      {
        id: "qr-preview",
        title: "Vista previa vs perfil público real",
        paragraphs: [
          "Ver perfil público (desde la tarjeta) abre la misma vista que vería un escaneo, pero en modo vista previa: no registra escaneo ni dispara alerta.",
          "Sirve para revisar cómo quedó antes de imprimir el QR.",
        ],
      },
      {
        id: "qr-editar-nombre-tipo",
        title: "Editar un perfil: qué sí y qué no",
        paragraphs: [
          "Desde Editar perfil podés actualizar contactos, instrucciones, foto, datos de salud (en Personas), PDF clínico (en Mascotas) y activar o desactivar el perfil.",
          "El nombre del beneficiario y el tipo de QR (Persona, Mascota u Objeto) quedan fijos después de crearlo. No se pueden cambiar desde el panel.",
          "Si te equivocaste al cargar el nombre o el tipo, escribinos por los canales de contacto con el requerimiento: indicá la razón del cambio y a qué valor querés pasarlo (nombre nuevo y/o tipo correcto).",
        ],
      },
    ],
  },
  {
    id: "personas",
    title: "5. Perfiles de Personas",
    summary: "Configuración y elementos de un perfil de emergencia para personas.",
    subsections: [
      {
        id: "personas-tarjeta",
        title: "Tarjeta en el panel",
        paragraphs: [
          "Cada persona aparece como una tarjeta con su nombre, tipo Persona, contactos y botones de acción:",
        ],
        bullets: [
          "Ver perfil: detalle completo del perfil en el panel.",
          "Editar perfil: modificar contactos, datos médicos e instrucciones (no el nombre ni el tipo).",
          "Ver perfil público: vista previa de lo que ve quien escanea.",
          "Ver QR / Ocultar QR: muestra el código para descargar o imprimir.",
          "Eliminar perfil: borra el perfil y su QR (acción irreversible).",
        ],
      },
      {
        id: "personas-formulario",
        title: "Campos del formulario",
        paragraphs: [
          "Al crear un perfil de persona cargás tipo, nombre y el resto de los datos. Al editar, el nombre y el tipo ya no se pueden cambiar; sí el resto:",
        ],
        bullets: [
          "Foto de perfil.",
          "Nombre de la persona beneficiaria (solo al crear; después pedilo por contacto si hace falta corregirlo).",
          "Contacto principal y secundario (nombre + teléfono).",
          "Instrucciones de manejo / comportamiento.",
          "Datos de salud en texto: tipo de sangre, alergias, condiciones médicas crónicas / medicación, y obra social / prepaga con N° de socio.",
          "Interruptor Perfil activo: si está apagado, el QR público no funciona.",
        ],
      },
      {
        id: "personas-sin-pdf",
        title: "Sin PDF clínico en Personas",
        paragraphs: [
          "En perfiles de Persona no se sube historial en PDF. En una emergencia importa leer rápido lo esencial en pantalla (sangre, alergias, medicación, obra social).",
          "Si necesitás un archivo clínico adjunto, usá un perfil de Mascota (PDF opcional) o guardá documentación fuera de SOSme.",
        ],
      },
    ],
  },
  {
    id: "mascotas",
    title: "6. Perfiles de Mascotas",
    summary: "Doble función: QR de emergencia si se pierde + libreta sanitaria privada.",
    subsections: [
      {
        id: "mascotas-diferencia",
        title: "Emergencia vs libreta sanitaria",
        paragraphs: [
          "Cada mascota tiene dos mundos separados:",
          "1) QR de emergencia (público): si alguien encuentra a tu mascota, escanea, te contacta y —si lo cargaste— puede descargar un PDF clínico opcional.",
          "2) Libreta sanitaria (privada): vacunas, desparasitaciones, visitas e indicaciones. Solo la ves vos logueado en el panel.",
        ],
      },
      {
        id: "mascotas-tarjeta",
        title: "Tarjeta en el panel",
        paragraphs: [
          "La tarjeta de mascota tiene botones específicos:",
        ],
        bullets: [
          "Abrir libreta sanitaria: entra al historial clínico completo.",
          "Ver perfil público: vista previa del QR de emergencia (contacto del dueño).",
          "Editar datos: foto, contactos, instrucciones y PDF clínico opcional del perfil QR (no el nombre ni el tipo).",
          "Ver QR: descarga del QR de emergencia para la chapita.",
        ],
      },
      {
        id: "mascotas-publico",
        title: "Qué aparece (y qué no) en el QR público de la mascota",
        paragraphs: [
          "Quien escanea el QR de emergencia de la mascota ve cómo contactarte al dueño, las instrucciones que cargaste y, si lo subiste, un botón para descargar el PDF clínico.",
          "No ve la libreta sanitaria completa (vacunas, visitas ni el historial del panel). Esa información solo está en tu cuenta, dentro de la libreta.",
        ],
      },
    ],
  },
  {
    id: "libreta",
    title: "7. Libreta sanitaria (pantalla por pantalla)",
    summary: "Guía detallada de /dashboard/perfiles/{id}/libreta.",
    subsections: [
      {
        id: "libreta-acceso",
        title: "Cómo llegar",
        paragraphs: [
          "Panel → Mascotas → tarjeta de la mascota → Abrir libreta sanitaria.",
          "También podés entrar desde el menú móvil (hamburguesa) → Mascotas → nombre → Libreta sanitaria.",
        ],
      },
      {
        id: "libreta-cabecera",
        title: "Cabecera verde",
        paragraphs: [
          "Arriba ves el nombre de la mascota y el texto «Libreta sanitaria — vacunas, visitas e indicaciones veterinarias».",
          "Volver a mascotas te regresa al panel. Editar datos abre el formulario del perfil QR (contactos, foto, instrucciones).",
        ],
      },
      {
        id: "libreta-qr-vet",
        title: "Botón «QR para veterinario»",
        paragraphs: [
          "Genera un enlace y QR temporal válido por 24 horas.",
          "Compartilo con el veterinario (WhatsApp, mostrar en pantalla, etc.). El profesional abre el enlace sin necesidad de cuenta SOSme.",
          "Este QR no es el de emergencia. No va en la chapita. Expira solo.",
        ],
      },
      {
        id: "libreta-proximas",
        title: "Próximas (cuidados preventivos)",
        paragraphs: [
          "Acá registrás vacunas, desparasitaciones y controles con fecha aplicada y próxima dosis.",
          "Si hay algo vencido o por vencer, aparece un banner de recordatorio.",
          "Podés agregar, editar o marcar como aplicados los ítems preventivos.",
        ],
      },
      {
        id: "libreta-visitas",
        title: "Visitas (historial clínico)",
        paragraphs: [
          "Sección colapsable con todas las consultas registradas.",
          "Cargar visita: vos podés anotar una visita manualmente (tipo, qué se hizo, indicaciones, archivos).",
          "Si el vet usó el enlace temporal, la visita aparece acá automáticamente y te llega una notificación.",
        ],
      },
    ],
  },
  {
    id: "veterinario",
    title: "8. Vista del veterinario",
    summary: "Qué ve y qué puede hacer el profesional con el enlace temporal.",
    subsections: [
      {
        id: "vet-acceso",
        title: "Cómo accede el veterinario",
        paragraphs: [
          "Vos generás el QR/enlace desde la libreta. El vet lo abre en su celular o computadora.",
          "No necesita registrarse ni instalar nada. Si el enlace expiró, debe pedirte uno nuevo.",
        ],
      },
      {
        id: "vet-puede",
        title: "Qué puede hacer",
        paragraphs: [
          "El veterinario puede:",
        ],
        bullets: [
          "Ver historial de visitas y cuidados preventivos.",
          "Consultar alergias o notas que cargaste en el perfil.",
          "Registrar una nueva visita: tipo (consulta, vacuna, desparasitación, tratamiento), qué se hizo e indicaciones para el hogar.",
          "Adjuntar archivos a la visita (imagen o PDF).",
        ],
      },
      {
        id: "vet-no-puede",
        title: "Qué NO puede hacer",
        paragraphs: [
          "El veterinario no puede editar tu cuenta, cambiar contactos de emergencia, ver otros perfiles ni acceder al panel del tutor.",
          "Tampoco puede usar ese enlace como QR de emergencia en la chapita.",
        ],
      },
    ],
  },
  {
    id: "objetos",
    title: "9. Perfiles de Objetos",
    summary: "Valijas, autos y equipos con QR de recuperación.",
    subsections: [
      {
        id: "objetos-funcion",
        title: "Para qué sirven",
        paragraphs: [
          "Si alguien encuentra tu objeto escaneado, ve cómo contactarte.",
          "Además, puede guardar la ubicación donde lo encontró. Vos ves ese punto en el panel.",
        ],
      },
      {
        id: "objetos-ubicacion",
        title: "Ubicación guardada",
        paragraphs: [
          "Cuando un objeto tiene ubicaciones guardadas, aparece un banner en el panel principal.",
          "Entrá al perfil del objeto para ver el mapa y el detalle de cada ubicación registrada.",
        ],
      },
    ],
  },
  {
    id: "actividad",
    title: "10. Actividad y alertas",
    summary: "Cómo revisar escaneos, responder y marcar eventos como leídos.",
    subsections: [
      {
        id: "actividad-lista",
        title: "Lista de actividad",
        paragraphs: [
          "Actividad muestra todos los eventos: escaneos normales, alertas SOS y mensajes.",
          "Los no leídos tienen indicador visual. Tocá uno para abrir el detalle.",
        ],
      },
      {
        id: "actividad-detalle",
        title: "Detalle de un evento",
        paragraphs: [
          "En el detalle podés:",
        ],
        bullets: [
          "Ver mapa con la ubicación compartida (si la hay).",
          "Chatear en vivo con quien escaneó.",
          "Identificar si fue un SOS.",
          "Marcar como leído al revisarlo.",
        ],
      },
    ],
  },
  {
    id: "activar-producto",
    title: "11. Activar un producto físico",
    summary: "Vincular una chapita o collar comprado a tu cuenta.",
    subsections: [
      {
        id: "activar-pasos",
        title: "Pasos",
        paragraphs: [
          "Expandí «Hola, este es tu panel» → Activar mi producto.",
          "Escaneá el QR del producto con la cámara o ingresá el código impreso.",
          "Completá el formulario de perfil. Si el producto es de mascota, el tipo puede venir bloqueado.",
          "Al terminar, volvés al panel con un mensaje de éxito y el QR ya queda vinculado.",
        ],
      },
      {
        id: "activar-diferencia",
        title: "Activación vs QR de emergencia",
        paragraphs: [
          "El QR impreso en el producto nuevo sirve primero para activarlo (una vez). Después de activar, ese mismo QR pasa a ser tu QR de emergencia permanente.",
          "No confundir con el QR temporal del veterinario, que se genera aparte desde la libreta.",
        ],
      },
    ],
  },
  {
    id: "cuenta",
    title: "12. Mi cuenta y soporte",
    summary: "Perfil de usuario, límites del plan y dónde pedir ayuda.",
    subsections: [
      {
        id: "cuenta-perfil",
        title: "Sección Perfil",
        paragraphs: [
          "En /dashboard/perfil podés exportar todos tus datos en ZIP o solicitar la baja de la cuenta.",
          "También revisás la versión de términos que aceptaste.",
        ],
      },
      {
        id: "cuenta-limites",
        title: "Límite de perfiles",
        paragraphs: [
          "El contador X/Y QR activos en el menú indica cuántos perfiles tenés respecto al plan.",
          "Si intentás crear más y llegaste al tope, aparece un aviso con enlace a contacto para ampliar.",
        ],
      },
      {
        id: "cuenta-soporte",
        title: "¿Más dudas?",
        paragraphs: [
          "Escribinos desde la página de contacto si algo no quedó claro o necesitás ayuda con tu cuenta.",
          "Si necesitás cambiar el nombre o el tipo de un QR porque te equivocaste al crearlo, usá esos mismos canales e indicá la razón y a qué valor querés cambiarlo.",
        ],
      },
    ],
  },
];
