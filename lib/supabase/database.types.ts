export type AppRole = "admin" | "lina" | "t2";

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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};