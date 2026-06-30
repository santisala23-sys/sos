const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

export function validatePassword(password: string): string | null {
  if (password.length < MIN_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_LENGTH} caracteres`;
  }
  if (password.length > MAX_LENGTH) {
    return `La contraseña no puede superar ${MAX_LENGTH} caracteres`;
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "La contraseña debe incluir al menos una letra";
  }
  if (!/[0-9]/.test(password)) {
    return "La contraseña debe incluir al menos un número";
  }
  return null;
}
