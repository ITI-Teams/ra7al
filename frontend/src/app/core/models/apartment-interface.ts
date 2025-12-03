export interface ApartmentInterface {
  id?: number;

  owner_id: number;
  city_id: number;
  area_id: number;

  title: string;
  description: string;
  price: number;
  address: string;

  gender_requirement: 'male' | 'female' | 'mixed';
  smoking_allowed: boolean;
  pets_allowed: boolean;

  total_rooms: number;
  available_rooms: number;
  bathrooms_count: number;
  beds: number;
  available_spots: number;

  size?: number;
  accommodation_type?: string;
  university?: string;

  available_from: string;
  available_to?: string;

  status: 'available' | 'partially_occupied' | 'fully_occupied' | 'maintenance' | 'inactive';

  // العلاقات
  amenities?: number[];
  payment_methods?: string[];
  images?: File[];
}
