export type AlertType = "scan" | "sos";

export type ProfileType = "person" | "pet" | "object";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin?: boolean;
  updated_at: string;
  created_at: string;
}

/** Perfil público sin IDs internos ni ubicación guardada del dueño */
export type PublicQrProfile = Omit<
  QrProfile,
  | "id"
  | "tutor_id"
  | "saved_latitude"
  | "saved_longitude"
  | "saved_location_at"
>;

export interface QrProfile {
  id: string;
  tutor_id: string;
  slug: string;
  profile_type: ProfileType;
  beneficiary_name: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  secondary_contact_name: string | null;
  secondary_contact_phone: string | null;
  instructions: string;
  medical_notes: string | null;
  allergies: string | null;
  blood_type: string | null;
  clinical_pdf_filename: string | null;
  clinical_pdf_uploaded_at: string | null;
  /** Última ubicación guardada (perfiles objeto: auto, valija, etc.). */
  saved_latitude?: number | null;
  saved_longitude?: number | null;
  saved_location_at?: string | null;
  sensitive_data_consent_at?: string | null;
  sensitive_data_consent_version?: string | null;
  is_active: boolean;
  created_at: string;
  /** Foto de perfil (avatar) en base64, presente solo en queries que la incluyen. */
  avatar_b64?: string | null;
  avatar_mime?: string | null;
}

export interface ScanLog {
  id: string;
  profile_id: string;
  scanned_at: string;
  latitude: number | null;
  longitude: number | null;
  user_agent: string | null;
  alert_type: AlertType;
  scanner_note: string | null;
  read_at: string | null;
  note_added_at: string | null;
}

export type ScanLogWithProfile = ScanLog & {
  beneficiary_name: string;
  slug: string;
};

export type QrProfileInsert = Pick<
  QrProfile,
  | "beneficiary_name"
  | "emergency_contact_name"
  | "emergency_contact_phone"
    | "instructions"
    | "medical_notes"
    | "allergies"
    | "blood_type"
    | "slug"
    | "profile_type"
    | "tutor_id"
>;

export type QrProfileUpdate = Partial<
  Pick<
    QrProfile,
    | "beneficiary_name"
    | "profile_type"
    | "emergency_contact_name"
    | "emergency_contact_phone"
    | "secondary_contact_name"
    | "secondary_contact_phone"
    | "instructions"
    | "medical_notes"
    | "allergies"
    | "blood_type"
    | "is_active"
  >
>;

export type MessageSender = "public" | "tutor";
export type ScanMessageMediaType = "image" | "audio";

export interface ScanMessage {
  id: string;
  scan_log_id: string;
  sender: MessageSender;
  body: string;
  created_at: string;
  media_type?: ScanMessageMediaType | null;
  media_mime?: string | null;
  media_filename?: string | null;
  /** Present when listing messages that include media (base64). */
  media_b64?: string | null;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export type VisitTag = "vaccine" | "deworming" | "treatment" | "checkup";

export type PreventiveKind = "vaccine" | "deworming";

export interface PetPreventiveItem {
  id: string;
  pet_id: string;
  kind: PreventiveKind;
  name: string;
  last_applied_at: string | null;
  next_due_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PetVisitAttachmentMeta {
  id: string;
  filename: string;
  mime: string;
}

/** Visita clínica de mascota (historial + indicaciones opcionales). */
export interface PetVetVisit {
  id: string;
  pet_id: string;
  visit_date: string;
  summary: string;
  indications: string;
  tags: VisitTag[];
  verified_by_vet: boolean;
  vet_name: string | null;
  vet_license: string | null;
  created_at: string;
  attachments?: PetVisitAttachmentMeta[];
}

export interface VetAccessToken {
  id: string;
  pet_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}
