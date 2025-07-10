import { getPensionInfo } from '../api';

export interface PensionInfo {
  id: string;
  name: string;
  address: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone: string;
  phone_secondary?: string;
  email: string;
  website?: string;
  manager_name?: string;
  owner_name?: string;
  company_id?: string;
  description?: string;
  check_in_time: string;
  check_out_time: string;
  breakfast_price?: number;
  rating?: number;
  location_rating?: number;
  opened_year?: number;
  languages_spoken?: string[];
  payment_methods?: string[];
  amenities?: string[];
  created_at: string;
}

/**
 * Get pension info/settings
 */
export async function getSettings(): Promise<PensionInfo> {
  return getPensionInfo();
}
