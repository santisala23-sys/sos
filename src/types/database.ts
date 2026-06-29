export type AlertType = "scan" | "sos";

export type ProfileType = "person" | "pet" | "object";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  updated_at: string;
  created_at: string;
}

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
  is_active: boolean;
  created_at: string;
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

export interface ScanMessage {
  id: string;
  scan_log_id: string;
  sender: MessageSender;
  body: string;
  created_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}
