export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function alertTypeLabel(type: string): string {
  switch (type) {
    case "sos":
      return "SOS — Necesita ayuda";
    case "scan":
      return "Escaneo QR";
    default:
      return type;
  }
}
