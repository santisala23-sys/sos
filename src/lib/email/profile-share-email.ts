import type { ProfileSharePermissionsInput } from "@/lib/profile-access";
import type { ProfileType } from "@/types/database";
import { PROFILE_TYPES } from "@/lib/profile-types";

export type ProfileShareEmailParams = {
  recipientName?: string | null;
  ownerName?: string | null;
  ownerEmail: string;
  profileName: string;
  profileType: ProfileType;
  permissions: ProfileSharePermissionsInput;
  expiresAt: string | null;
  dashboardUrl: string;
  isUpdate?: boolean;
};

const PERMISSION_LABELS: {
  key: keyof ProfileSharePermissionsInput;
  label: string;
}[] = [
  { key: "can_receive_alerts", label: "Recibir alertas push" },
  { key: "can_view_profile", label: "Ver perfil" },
  { key: "can_edit_profile", label: "Editar perfil" },
  { key: "can_view_health_book", label: "Ver libreta sanitaria" },
  { key: "can_save_location", label: "Guardar ubicación" },
];

export function formatSharePermissionsList(
  permissions: ProfileSharePermissionsInput,
): string[] {
  return PERMISSION_LABELS.filter(({ key }) => permissions[key]).map(
    ({ label }) => label,
  );
}

export function formatShareExpiryLabel(expiresAt: string | null): string {
  if (!expiresAt) return "Acceso permanente (sin fecha de vencimiento)";
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return "Sin fecha de vencimiento";
  return `Hasta el ${date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

function formatOwnerLabel(name: string | null | undefined, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return email.split("@")[0] ?? email;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function profileShareEmail(
  params: ProfileShareEmailParams,
): { subject: string; html: string; text: string } {
  const greeting = params.recipientName?.trim()
    ? `Hola ${params.recipientName.trim()},`
    : "Hola,";
  const ownerLabel = formatOwnerLabel(params.ownerName, params.ownerEmail);
  const profileTypeLabel =
    PROFILE_TYPES.find((item) => item.value === params.profileType)?.label ??
    "Perfil";
  const permissionLines = formatSharePermissionsList(params.permissions);
  const expiryLabel = formatShareExpiryLabel(params.expiresAt);
  const isUpdate = params.isUpdate ?? false;

  const subject = isUpdate
    ? `${ownerLabel} actualizó tu acceso a un perfil SOSme`
    : `${ownerLabel} te agregó como co-tutor en SOSme`;

  const intro = isUpdate
    ? `<strong>${escapeHtml(ownerLabel)}</strong> actualizó los permisos que tenés sobre este perfil compartido:`
    : `<strong>${escapeHtml(ownerLabel)}</strong> te compartió acceso al perfil de <strong>${escapeHtml(params.profileName)}</strong> en SOSme.`;

  const permissionsHtml = permissionLines
    .map(
      (line) =>
        `<li style="margin:0 0 8px;color:#404040;font-size:14px;line-height:1.5;">${escapeHtml(line)}</li>`,
    )
    .join("");

  const permissionsText = permissionLines.map((line) => `- ${line}`).join("\n");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(124,58,237,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 32px 28px;text-align:center;">
              <div style="display:inline-block;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">
                SOS<span style="color:#c4b5fd;">me</span>
              </div>
              <p style="margin:10px 0 0;color:#ede9fe;font-size:14px;">
                ${isUpdate ? "Acceso actualizado" : "Nuevo perfil compartido"}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#171717;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 24px;color:#525252;font-size:15px;line-height:1.6;">
                ${intro}
              </p>

              <div style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:20px;margin:0 0 24px;">
                <p style="margin:0 0 8px;color:#737373;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Perfil</p>
                <p style="margin:0 0 4px;color:#171717;font-size:18px;font-weight:800;">${escapeHtml(params.profileName)}</p>
                <p style="margin:0;color:#525252;font-size:14px;">${escapeHtml(profileTypeLabel)}</p>
              </div>

              <p style="margin:0 0 12px;color:#171717;font-size:15px;font-weight:700;">Permisos habilitados</p>
              <ul style="margin:0 0 24px;padding-left:20px;">
                ${permissionsHtml}
              </ul>

              <div style="background-color:#f5f3ff;border:1px solid #ddd6fe;border-radius:16px;padding:16px 18px;margin:0 0 24px;">
                <p style="margin:0 0 4px;color:#6d28d9;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Vigencia</p>
                <p style="margin:0;color:#404040;font-size:14px;line-height:1.5;">${escapeHtml(expiryLabel)}</p>
              </div>

              <div style="text-align:center;margin:0 0 24px;">
                <a href="${params.dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:12px;">
                  Ir a Compartidos conmigo
                </a>
              </div>

              <p style="margin:0;color:#737373;font-size:13px;line-height:1.6;">
                En tu panel vas a encontrar este perfil en la sección <strong>Compartidos conmigo</strong>.
                ${params.permissions.can_receive_alerts ? " Si tenés notificaciones activadas, también recibirás alertas push cuando escaneen el QR." : ""}
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #f0f0f0;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#a3a3a3;font-size:12px;line-height:1.5;">
                SOSme — Contacto de emergencia con un simple QR
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${greeting}

${isUpdate ? `${ownerLabel} actualizó tu acceso al perfil "${params.profileName}" (${profileTypeLabel}).` : `${ownerLabel} te agregó como co-tutor del perfil "${params.profileName}" (${profileTypeLabel}).`}

Permisos habilitados:
${permissionsText}

Vigencia: ${expiryLabel}

Entrá a tu panel: ${params.dashboardUrl}
Sección: Compartidos conmigo`;

  return { subject, html, text };
}
