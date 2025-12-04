/**
 * Property Model - Interfaces for strongly-typed property data
 */

export interface PropertyImage {
  id: number;
  url?: string;
  path?: string;
  priority: number;
  thumbnail?: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

export interface City {
  id: number;
  name: string;
}

export interface Area {
  id: number;
  name: string;
  city_id?: number;
}

export interface Location {
  city: City;
  area: Area;
}

export interface Owner {
  id: number;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  rating?: number;
}

export interface Comment {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

export interface Roommate {
  id: number;
  name: string;
  avatar?: string;
  university: string;
}

export interface ActiveRental {
  id: number;
  tenant: {
    id: number;
    name: string;
    avatar?: string;
  };
  start_date: string;
  end_date: string;
  monthly_rent: number;
  room_number?: string;
  next_payment_date: string;
}

export interface RentalRequest {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  desired_start_date: string;
  duration_months: number;
  message?: string;
  created_at: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  gender_requirement: 'male' | 'female' | 'mixed';
  smoking_allowed: boolean;
  pets_allowed: boolean;
  furnished: boolean;
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
  location: Location;
  owner: Owner;
  images: PropertyImage[];
  amenities: Amenity[];
  payment_methods?: string[];
  current_tenants_count?: number;
  average_rating?: number;
  is_available?: boolean;
  is_saved?: boolean;
  comments?: Comment[];
  created_at: string;
  updated_at?: string;
  // Optional detailed fields (when fetching single property with permissions)
  rentals?: ActiveRental[];
  pending_requests?: RentalRequest[];
}

export interface PropertyResponse {
  success: boolean;
  data: Property;
  message?: string;
}

export interface PropertiesListResponse {
  success: boolean;
  data: {
    data: Property[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters?: {
    cities: City[];
    areas: Area[];
    accommodation_types: string[];
    price_ranges: Array<{min: number; max: number; label: string}>;
    rooms_options: number[];
    sort_options: Array<{value: string; label: string}>;
  };
}

export interface CityResponse {
  success: boolean;
  data: City[];
}

export interface AreaResponse {
  success: boolean;
  data: Area[];
}

export interface AmenityResponse {
  success: boolean;
  data: Amenity[];
}

export interface PropertyPermissions {
  can_edit: boolean;
  can_rent: boolean;
  can_view_tenants: boolean;
  can_view_requests: boolean;
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  price: number;
  address: string;
  city_id: number;
  area_id: number;
  gender_requirement: 'male' | 'female' | 'mixed';
  smoking_allowed: boolean;
  pets_allowed: boolean;
  furnished: boolean;
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
  amenities?: number[];
  payment_methods?: string[];
  images?: File[];
  owner_id: number;
}
