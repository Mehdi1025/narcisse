export type AppRole = "admin" | "employee";

export type ProfileRow = {
  id: string;
  role: AppRole;
  worker_id: string | null;
  username: string;
  display_name: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
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