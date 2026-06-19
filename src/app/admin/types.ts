export interface Product {
  id: string; name: string; category: string; det: string; price: string
  fabric: string; wa: string; featured: boolean; images: string[]
  created_at?: string; deleted_at?: string
}
export interface Category { id: string; label: string; color: string; fixed: boolean }
export interface Slot { type: string; ref_id: string; label: string; cover?: string }
export interface AppCfg { brand: string; brandL: string; brandP: string; sec: string; pill: string; accent: string }
export interface ImgItem { src: string; file?: File }
export interface Settings { wa_number: string; admin_name: string }
