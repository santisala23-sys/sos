export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildProfileShareInviteWhatsAppMessage(params: {
  ownerLabel: string;
  profileName: string;
  inviteUrl: string;
}): string {
  return (
    `¡Hola! ${params.ownerLabel} te comparte acceso al perfil de ${params.profileName} en SOSme.\n\n` +
    `1) Abrí el link\n2) Iniciá sesión o creá tu cuenta gratis\n3) Aceptá la invitación\n\n` +
    params.inviteUrl
  );
}
