"use client";

import { useState } from "react";
import { Pencil, Trash2, QrCode } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { QrCodeDisplay } from "@/components/dashboard/QrCodeDisplay";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";

type QrProfileListProps = {
  profiles: QrProfile[];
  onRefresh: () => void;
};

export function QrProfileList({ profiles, onRefresh }: QrProfileListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showQrId, setShowQrId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este perfil QR? Esta acción no se puede deshacer.")) {
      return;
    }
    await fetch(`/api/qr-profiles/${id}`, { method: "DELETE" });
    onRefresh();
  }

  if (profiles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 px-6 py-10 text-center text-neutral-600">
        Todavía no creaste ningún perfil. Usá el formulario de arriba para
        agregar el primero.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {profiles.map((profile) => (
        <li
          key={profile.id}
          className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                {profile.beneficiary_name}
              </h3>
              <p className="text-sm text-neutral-600">
                Contacto: {profile.emergency_contact_name} ·{" "}
                {profile.emergency_contact_phone}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                /p/{profile.slug}
                {!profile.is_active && " · Inactivo"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setShowQrId(showQrId === profile.id ? null : profile.id)
                }
                className="gap-1"
              >
                <QrCode className="h-4 w-4" aria-hidden />
                QR
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setEditingId(editingId === profile.id ? null : profile.id)
                }
                className="gap-1"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Editar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDelete(profile.id)}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Eliminar
              </Button>
            </div>
          </div>

          {showQrId === profile.id && (
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <QrCodeDisplay
                slug={profile.slug}
                beneficiaryName={profile.beneficiary_name}
              />
            </div>
          )}

          {editingId === profile.id && (
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <QrProfileForm
                profile={profile}
                onSuccess={() => {
                  setEditingId(null);
                  onRefresh();
                }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
