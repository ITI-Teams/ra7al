export interface ApartmentInterface {
  id?: number;
  title: string;
  description: string;
  price: number;
  address: string;
  city_id: number;
  area_id: number;
  available_spots: number;
  gender_requirement: 'male' | 'female' | 'mixed';
  smoking_allowed: boolean;
  pets_allowed: boolean;
  total_rooms: number;
  available_rooms: number;
  bathrooms_count: number;
  beds: number;
  size: number;
  accommodation_type: string;
  university: string;
  available_from: string;
  available_to: string;
  amenities: number[];
  contact_phone: string;
  contact_email: string;
  is_negotiable: boolean;
  minimum_stay_months: number;
  security_deposit: number;
  payment_methods: string[];
  owner_id: number;
  furnished: boolean;
  images: File[]; // للرفع
}
