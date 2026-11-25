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

export type Database = {
  public: {
    Tables: {
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
    };
    Enums: Record<string, never>;
  };
};