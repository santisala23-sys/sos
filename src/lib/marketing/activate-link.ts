export const ACTIVATE_PRODUCT_DESTINATION = "/dashboard#activar-producto";

export function getActivateCodeHref(isLoggedIn: boolean): string {
  if (isLoggedIn) {
    return ACTIVATE_PRODUCT_DESTINATION;
  }

  return `/login?redirect=${encodeURIComponent(ACTIVATE_PRODUCT_DESTINATION)}`;
}
