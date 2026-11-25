export type WorkshopStatus = "draft" | "pending" | "published" | "rejected" | "cancelled";
export type RegistrationStatus = "registered" | "waitlist" | "cancelled" | "attended";

export type WorkshopRow = {
  id: string;
  proposed_by: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  location: string;
  status: WorkshopStatus;
  admin_note: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkshopRegistrationRow = {
  id: string;
  workshop_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: RegistrationStatus;
  waitlist_position: number | null;
  created_at: string;
};

export type WorkshopInput = {
  title: string;
  description?: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  location?: string;
};