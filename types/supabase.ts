export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          sku: string;
          brand_id: number | null;
          category_id: number | null;
          name: string;
          slug: string;
          condition: 'resigilat' | 'ex_demo';
          defect_notes: string | null;
          defect_photos: Json | null;
          price_public_ttc: number;
          price_original: number | null;
          price_partner_net: number | null;
          vat_rate: number;
          stock_qty: number;
          location: string | null;
          warranty_months: number | null;
          attachments: Json | null;
          gallery: Json | null;
          visible: boolean;
        };
        Insert: {
          id?: number;
          sku: string;
          brand_id?: number | null;
          category_id?: number | null;
          name: string;
          slug: string;
          condition: 'resigilat' | 'ex_demo';
          defect_notes?: string | null;
          defect_photos?: Json | null;
          price_public_ttc: number;
          price_partner_net?: number | null;
          vat_rate?: number;
          stock_qty?: number;
          location?: string | null;
          warranty_months?: number | null;
          attachments?: Json | null;
          gallery?: Json | null;
          visible?: boolean;
        };
        Update: {
          id?: number;
          sku?: string;
          brand_id?: number | null;
          category_id?: number | null;
          name?: string;
          slug?: string;
          condition?: 'resigilat' | 'ex_demo';
          defect_notes?: string | null;
          defect_photos?: Json | null;
          price_public_ttc?: number;
          price_original?: number | null;
          price_partner_net?: number | null;
          vat_rate?: number;
          stock_qty?: number;
          location?: string | null;
          warranty_months?: number | null;
          attachments?: Json | null;
          gallery?: Json | null;
          visible?: boolean;
        };
      };
      users: {
        Row: {
          id: number;
          role: 'visitor' | 'partner' | 'admin';
          company_name: string | null;
          vat_id: string | null;
          contact_name: string | null;
          email: string;
          phone: string | null;
          partner_status: 'pending' | 'active' | 'suspended' | null;
          agreed_terms_version: string | null;
          agreed_terms_at: string | null;
        };
        // Add Insert and Update as needed
      };
      catalogs: {
        Row: {
          id: number;
          brand_id: number | null;
          title: string;
          version: string;
          file_url: string;
          valid_from: string | null;
          valid_to: string | null;
          tags: Json | null;
        };
        // Add Insert and Update as needed
      };
    };
  };
}