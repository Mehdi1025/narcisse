export type AppRole = "admin" | "employee";

export type ProfileRow = {
  id: string;
  role: AppRole;
  worker_id: string | null;
  username: string;
  display_name: string;
  created_at: string;
};

export type ProductUniverse = "skincare" | "art-de-vivre" | "developpement" | "editions";

export type ProductTableRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  universe: ProductUniverse;
  price_cents: number | null;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WorkshopTableRow = {
  id: string;
  proposed_by: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  location: string;
  status: string;
  admin_note: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkshopRegistrationTableRow = {
  id: string;
  workshop_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  waitlist_position: number | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      workshops: {
        Row: WorkshopTableRow;
        Insert: Omit<WorkshopTableRow, "id" | "created_at" | "updated_at" | "published_at" | "admin_note"> & {
          id?: string;
          status?: string;
          admin_note?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workshops"]["Insert"]>;
        Relationships: [];
      };
      workshop_registrations: {
        Row: WorkshopRegistrationTableRow;
        Insert: Omit<WorkshopRegistrationTableRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["workshop_registrations"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: ProductTableRow;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tagline?: string | null;
          description?: string;
          universe: ProductUniverse;
          price_cents?: number | null;
          image_url?: string | null;
          featured?: boolean;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          role: AppRole;
          worker_id?: string | null;
          username: string;
          display_name: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_profile: {
        Args: Record<string, never>;
        Returns: { role: AppRole; worker_id: string | null }[];
      };
      register_for_workshop: {
        Args: { p_workshop_id: string; p_full_name: string; p_email: string; p_phone: string | null };
        Returns: Record<string, unknown>;
      };
    };
    Enums: Record<string, never>;
  };
};