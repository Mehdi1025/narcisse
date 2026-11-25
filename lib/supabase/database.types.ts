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
  stock_on_hand?: number;
  stock_reserved?: number;
  stock_alert_threshold?: number;
  created_at: string;
  updated_at: string;
};

export type ShopOrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready_pickup"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type ShopPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type FulfillmentType = "pickup" | "shipping";

export type ShopOrderTableRow = {
  id: string;
  order_number: string;
  status: ShopOrderStatus;
  payment_status: ShopPaymentStatus;
  fulfillment: FulfillmentType;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_postal_code: string | null;
  shipping_city: string | null;
  shipping_country: string;
  shipping_cost_cents: number;
  subtotal_cents: number;
  total_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  tracking_token: string;
  paid_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ShopOrderLineTableRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
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
          stock_on_hand?: number;
          stock_reserved?: number;
          stock_alert_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      shop_orders: {
        Row: ShopOrderTableRow;
        Insert: Omit<ShopOrderTableRow, "id" | "created_at" | "updated_at" | "paid_at" | "stripe_checkout_session_id" | "admin_note"> & {
          id?: string;
          tracking_token?: string;
          created_at?: string;
          updated_at?: string;
          paid_at?: string | null;
          stripe_checkout_session_id?: string | null;
          admin_note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["shop_orders"]["Insert"]>;
        Relationships: [];
      };
      shop_order_lines: {
        Row: ShopOrderLineTableRow;
        Insert: Omit<ShopOrderLineTableRow, "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["shop_order_lines"]["Insert"]>;
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
      admin_list_workshops: {
        Args: Record<string, never>;
        Returns: WorkshopTableRow[];
      };
      admin_review_workshop: {
        Args: { p_workshop_id: string; p_action: string; p_note: string | null };
        Returns: WorkshopTableRow;
      };
      generate_shop_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      complete_shop_order_payment: {
        Args: { p_order_id: string; p_stripe_session_id?: string | null };
        Returns: ShopOrderTableRow;
      };
      get_shop_order_by_tracking_token: {
        Args: { p_token: string };
        Returns: Record<string, unknown> | null;
      };
      reserve_stock_for_order: {
        Args: { p_order_id: string; p_minutes?: number | null };
        Returns: void;
      };
      commit_reserved_stock_for_order: {
        Args: { p_order_id: string };
        Returns: void;
      };
      release_stock_reservation_for_order: {
        Args: { p_order_id: string; p_note?: string | null };
        Returns: void;
      };
      release_expired_stock_reservations: {
        Args: Record<string, never>;
        Returns: number;
      };
      adjust_product_stock: {
        Args: { p_product_id: string; p_delta: number; p_reason: string; p_note?: string | null };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
};