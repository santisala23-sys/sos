export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

/** Hostname for print labels (e.g. sosme.com.ar). */
export function getAppHostname(): string {
  try {
    return new URL(getAppUrl()).hostname;
  } catch {
    return "localhost";
  }
}
