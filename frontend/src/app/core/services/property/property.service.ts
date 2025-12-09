// src/app/services/property.service.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Property,
  PropertyResponse,
  PropertiesListResponse,
  City,
  Area,
  Amenity,
  CityResponse,
  AreaResponse,
  AmenityResponse,
  University,
  UniversityResponse,
  FilterState,
} from '../../models/property.model';

export interface BookingRequest {
  desired_start_date: string;
  duration_months: number;
  message?: string;
}
export interface BookingResponse {
  success: boolean;
  message: string;
  booking_id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;

  // Signal to track loading state
  isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  /**
   * Fetch property details by ID from API
   * Falls back to mock data if API fails
   */
  getPropertyById(id: number): Observable<Property> {
    this.isLoading.set(true);

    return this.http.get<PropertyResponse>(`${this.apiUrl}/show/${id}`).pipe(
      map((response) => {
        this.isLoading.set(false);
        return response.data;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API call failed to fetch property:', error);
        this.isLoading.set(false);
        // Throw the actual error instead of returning mock data
        throw error;
      })
    );
  }

  /**
   * Fetch owner's own properties
   */
  getOwnerProperties(
    page: number = 1,
    perPage: number = 100
  ): Observable<PropertiesListResponse> {
    this.isLoading.set(true);

    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    return this.http
      .get<PropertiesListResponse>(
        `${this.apiUrl}/my-properties?${params.toString()}`
      )
      .pipe(
        tap(() => this.isLoading.set(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to fetch owner properties:', error);
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  /**
   * Fetch a specific property owned by the current user with full details for editing
   */
  getOwnerPropertyById(id: number): Observable<Property> {
    this.isLoading.set(true);

    return this.http
      .get<PropertyResponse>(`${this.apiUrl}/my-properties/${id}`)
      .pipe(
        map((response) => {
          this.isLoading.set(false);
          return response.data;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to fetch owner property details:', error);
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  /**
   * Fetch all properties with pagination and filters
   */
  getProperties(
    page: number = 1,
    perPage: number = 12,
    filters?: any
  ): Observable<PropertiesListResponse> {
    if (filters && Object.keys(filters).length > 0) {
      return this.filterProperties(filters, page, perPage);
    }

    this.isLoading.set(true);

    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    return this.http
      .get<PropertiesListResponse>(`${this.apiUrl}?${params.toString()}`)
      .pipe(
        tap(() => this.isLoading.set(false)),
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to fetch properties:', error);
          this.isLoading.set(false);
          throw error;
        })
      );
  }

  /**
   * Toggle saved status for a property
   */
  toggleSaved(
    propertyId: number
  ): Observable<{ saved: boolean; message: string }> {
    return this.http
      .post<{ saved: boolean; message: string }>(
        `${this.apiUrl}/${propertyId}/toggle-save`,
        {}
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to toggle saved status:', error);
          throw error;
        })
      );
  }

  /**
   * Create a new property
   */
  createProperty(propertyData: FormData): Observable<PropertyResponse> {
    return this.http
      .post<PropertyResponse>(`${this.apiUrl}`, propertyData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to create property:', error);
          throw error;
        })
      );
  }

  /**
   * Update an existing property
   */
  updateProperty(
    propertyId: number,
    propertyData: FormData | Partial<Property>
  ): Observable<PropertyResponse> {
    return this.http
      .put<PropertyResponse>(`${this.apiUrl}/${propertyId}`, propertyData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to update property:', error);
          throw error;
        })
      );
  }

  /**
   * Delete a property
   */
  deleteProperty(
    propertyId: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.apiUrl}/${propertyId}`
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to delete property:', error);
          throw error;
        })
      );
  }

  /**
   * Fetch list of cities from API
   */
  getCities(): Observable<City[]> {
    return this.http.get<CityResponse>(`${environment.apiUrl}/cities`).pipe(
      map((res) => res.data),
      catchError((error) => {
        console.error('Failed to fetch cities:', error);
        return of([]);
      })
    );
  }

  /**
   * Fetch areas for a given city
   */
  getAreas(cityId: number): Observable<Area[]> {
    return this.http
      .get<AreaResponse>(`${environment.apiUrl}/cities/${cityId}/areas`)
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          console.error('Failed to fetch areas:', error);
          return of([]);
        })
      );
  }

  /**
   * Fetch amenities list
   */
  getAmenities(): Observable<Amenity[]> {
    return this.http
      .get<AmenityResponse>(`${environment.apiUrl}/amenities`)
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          console.error('Failed to fetch amenities:', error);
          return of([]);
        })
      );
  }

  getUniversities(): Observable<University[]> {
    return this.http
      .get<UniversityResponse>(`${environment.apiUrl}/properties/universities`)
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          console.error('Failed to fetch universities:', error);
          return of(this.getMockUniversities());
        })
      );
  }

  /**
   * Fetch universities for a given city
   */
  getUniversitiesByCity(cityId: number): Observable<University[]> {
    return this.http
      .get<UniversityResponse>(
        `${environment.apiUrl}/properties/universities/${cityId}`
      )
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          console.error('Failed to fetch universities for city:', error);
          const allUniversities = this.getMockUniversities();
          return of(allUniversities.filter((u) => u.city_id === cityId));
        })
      );
  }
  filterProperties(
    filters: FilterState | any,
    page: number = 1,
    perPage: number = 12
  ): Observable<PropertiesListResponse> {
    this.isLoading.set(true);

    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    if (filters?.university_id) {
      params.append('university_id', filters.university_id.toString());
    }

    if (filters?.propertyType || filters?.accommodation_type) {
      const accommodationType =
        filters.propertyType || filters.accommodation_type;
      params.append('accommodation_type', accommodationType);
    }

    if (filters?.gender || filters?.gender_requirement) {
      const genderRequirement = filters.gender || filters.gender_requirement;
      params.append('gender_requirement', genderRequirement.toLowerCase());
    }

    if (filters?.priceRange && filters.priceRange.length === 2) {
      const defaultPriceRange = [100, 700];
      if (
        filters.priceRange[0] !== defaultPriceRange[0] ||
        filters.priceRange[1] !== defaultPriceRange[1]
      ) {
        params.append('min_price', filters.priceRange[0].toString());
        params.append('max_price', filters.priceRange[1].toString());
      }
    }

    if (filters?.studentsRange && filters.studentsRange.length === 2) {
      const defaultStudentsRange = [1, 8];
      if (
        filters.studentsRange[0] !== defaultStudentsRange[0] ||
        filters.studentsRange[1] !== defaultStudentsRange[1]
      ) {
        params.append(
          'min_available_spots',
          filters.studentsRange[0].toString()
        );
        params.append(
          'max_available_spots',
          filters.studentsRange[1].toString()
        );
      }
    }

    if (filters?.bedsRange && filters.bedsRange.length === 2) {
      const defaultBedsRange = [1, 10];
      if (
        filters.bedsRange[0] !== defaultBedsRange[0] ||
        filters.bedsRange[1] !== defaultBedsRange[1]
      ) {
        params.append('min_beds', filters.bedsRange[0].toString());
        params.append('max_beds', filters.bedsRange[1].toString());
      }
    }

    if (filters?.roomsRange && filters.roomsRange.length === 2) {
      const defaultRoomsRange = [1, 6];
      if (
        filters.roomsRange[0] !== defaultRoomsRange[0] ||
        filters.roomsRange[1] !== defaultRoomsRange[1]
      ) {
        params.append('min_rooms', filters.roomsRange[0].toString());
        params.append('max_rooms', filters.roomsRange[1].toString());
      }
    }

    if (filters?.min_price !== undefined && filters?.min_price !== null) {
      params.append('min_price', filters.min_price.toString());
    }
    if (filters?.max_price !== undefined && filters?.max_price !== null) {
      params.append('max_price', filters.max_price.toString());
    }

    if (
      filters?.min_available_spots !== undefined &&
      filters?.min_available_spots !== null
    ) {
      params.append(
        'min_available_spots',
        filters.min_available_spots.toString()
      );
    }
    if (
      filters?.max_available_spots !== undefined &&
      filters?.max_available_spots !== null
    ) {
      params.append(
        'max_available_spots',
        filters.max_available_spots.toString()
      );
    }

    if (filters?.min_beds !== undefined && filters?.min_beds !== null) {
      params.append('min_beds', filters.min_beds.toString());
    }
    if (filters?.max_beds !== undefined && filters?.max_beds !== null) {
      params.append('max_beds', filters.max_beds.toString());
    }

    if (filters?.min_rooms !== undefined && filters?.min_rooms !== null) {
      params.append('min_rooms', filters.min_rooms.toString());
    }
    if (filters?.max_rooms !== undefined && filters?.max_rooms !== null) {
      params.append('max_rooms', filters.max_rooms.toString());
    }

    if (filters?.petsAllowed !== null && filters?.petsAllowed !== undefined) {
      params.append('pets_allowed', filters.petsAllowed.toString());
    }

    if (
      filters?.smokingAllowed !== null &&
      filters?.smokingAllowed !== undefined
    ) {
      params.append('smoking_allowed', filters.smokingAllowed.toString());
    }

    if (filters?.city_id) {
      params.append('city_id', filters.city_id.toString());
    }

    if (filters?.area_id) {
      params.append('area_id', filters.area_id.toString());
    }

    if (filters?.sort_by) {
      params.append('sort_by', filters.sort_by);
    }

    const queryString = params.toString();
    const apiUrl = queryString
      ? `${this.apiUrl}/filter?${queryString}`
      : `${this.apiUrl}/filter`;

    console.log('API Call:', apiUrl);

    return this.http.get<PropertiesListResponse>(apiUrl).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to filter properties:', error);
        this.isLoading.set(false);
        return of(this.getMockFilteredProperties(filters, page, perPage));
      })
    );
  }

  /**
   * Mock property data for development/fallback
   */
  private getMockProperty(id: number): Property {
    return {
      id: id,
      title: 'Ethel studios, inner city, Cairo',
      description: `Liberty Park student accommodation in Leicester is ideal for those who wish to experience student life with diversity and modernity between their social and academic life. Located on New Drake Road, Liberty Park Leicester offers a range of rooms from classic ensuite to premium studios situated near to oakston, this University of Leicester accommodation offers easy access close to the city centre with its shopping, night life, cafes and activities.

      Famous for its diversity and rich culture, Liberty Park Leicester offers a vibrant atmosphere while learning and living. Equipped with essential amenities, offering you convenience and comfort during your stay through the quality education that.`,
      price: 3150,
      address: 'New Drake Road, Leicester LE2 8BJ',
      gender_requirement: 'mixed',
      smoking_allowed: false,
      pets_allowed: false,
      furnished: true,
      total_rooms: 3,
      available_rooms: 2,
      bathrooms_count: 2,
      beds: 6,
      available_spots: 2,
      size: 75,
      accommodation_type: 'apartment',
      available_from: '2025-08-26',
      status: 'available',
      location: {
        city: {
          id: 1,
          name: 'Cairo',
        },
        area: {
          id: 1,
          name: 'Downtown',
          city: {
            id: 1,
            name: 'Cairo',
          },
        },
      },
      area: {
        id: 1,
        name: 'Downtown',
        city: {
          id: 1,
          name: 'Cairo',
        },
      },
      owner: {
        id: 1,
        name: 'Ahmed Hassan',
        avatar: 'https://i.pravatar.cc/150?img=12',
        phone: '+20 123 456 7890',
        rating: 4.8,
      },
      images: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          path: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          priority: 1,
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          path: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          priority: 2,
        },
        {
          id: 3,
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          path: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          priority: 3,
        },
        {
          id: 4,
          url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
          path: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
          priority: 4,
        },
      ],
      amenities: [
        { id: 1, name: 'AC', icon: 'pi pi-sun' },
        { id: 2, name: 'Electricity', icon: 'pi pi-bolt' },
        { id: 3, name: 'Water', icon: 'pi pi-droplet' },
        { id: 4, name: 'Fridge', icon: 'pi pi-box' },
        { id: 5, name: 'Microwave', icon: 'pi pi-box' },
        { id: 6, name: 'Smart TV', icon: 'pi pi-desktop' },
        { id: 7, name: 'Wash machine', icon: 'pi pi-replay' },
      ],
      payment_methods: ['cash', 'bank_transfer'],
      average_rating: 4.8,
      is_available: true,
      is_saved: false,
      created_at: '2025-01-15T10:00:00Z',
    };
  }

  private getMockUniversities(): University[] {
    return [
      { id: 1, name: 'Cairo University', abbreviation: 'CU', city_id: 1 },
      { id: 2, name: 'Ain Shams University', abbreviation: 'ASU', city_id: 1 },
      { id: 3, name: 'Alexandria University', abbreviation: 'AU', city_id: 2 },
      { id: 4, name: 'Helwan University', abbreviation: 'HU', city_id: 1 },
      { id: 5, name: 'Zagazig University', abbreviation: 'ZU', city_id: 3 },
      { id: 6, name: 'Mansoura University', abbreviation: 'MU', city_id: 4 },
      { id: 7, name: 'Assiut University', abbreviation: 'AU', city_id: 5 },
      { id: 8, name: 'Tanta University', abbreviation: 'TU', city_id: 6 },
      { id: 9, name: 'Suez Canal University', abbreviation: 'SCU', city_id: 7 },
      { id: 10, name: 'Menoufia University', abbreviation: 'MU', city_id: 8 },
    ];
  }

  private getMockFilteredProperties(
    filters: any,
    page: number,
    perPage: number
  ): PropertiesListResponse {
    let mockProperties = this.getAllMockProperties();

    mockProperties = this.applyMockFilters(mockProperties, filters);

    // Pagination
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedProperties = mockProperties.slice(start, end);

    const mockFilters = this.getMockFilters();

    return {
      success: true,
      data: {
        data: paginatedProperties,
        current_page: page,
        last_page: Math.ceil(mockProperties.length / perPage),
        per_page: perPage,
        total: mockProperties.length,
      },
      filters: mockFilters,
    };
  }

  private getAllMockProperties(): Property[] {
    const mockProperty1 = this.getMockProperty(1);
    const mockProperty2 = this.getMockProperty(2);
    const mockProperty3 = this.getMockProperty(3);

    return [
      { ...mockProperty1, university_id: 1, accommodation_type: 'apartment' },
      {
        ...mockProperty2,
        university_id: 2,
        accommodation_type: 'shared',
        gender_requirement: 'female',
      },
      {
        ...mockProperty3,
        university_id: 3,
        accommodation_type: 'private',
        gender_requirement: 'male',
      },
      {
        ...mockProperty1,
        id: 4,
        university_id: 1,
        price: 250,
        available_spots: 3,
      },
      {
        ...mockProperty2,
        id: 5,
        university_id: 2,
        price: 400,
        available_spots: 1,
      },
      {
        ...mockProperty3,
        id: 6,
        university_id: 3,
        price: 600,
        available_spots: 2,
      },
    ];
  }

  private applyMockFilters(properties: Property[], filters: any): Property[] {
    return properties.filter((property) => {
      if (
        filters?.university_id &&
        property.university_id !== filters.university_id
      ) {
        return false;
      }

      if (
        filters?.propertyType &&
        property.accommodation_type !== filters.propertyType
      ) {
        return false;
      }
      if (
        filters?.accommodation_type &&
        property.accommodation_type !== filters.accommodation_type
      ) {
        return false;
      }

      if (
        filters?.gender &&
        property.gender_requirement !== filters.gender.toLowerCase()
      ) {
        return false;
      }
      if (
        filters?.gender_requirement &&
        property.gender_requirement !== filters.gender_requirement
      ) {
        return false;
      }

      if (
        filters?.priceRange &&
        (property.price < filters.priceRange[0] ||
          property.price > filters.priceRange[1])
      ) {
        return false;
      }
      if (
        (filters?.min_price && property.price < filters.min_price) ||
        (filters?.max_price && property.price > filters.max_price)
      ) {
        return false;
      }

      if (
        filters?.studentsRange &&
        (property.available_spots < filters.studentsRange[0] ||
          property.available_spots > filters.studentsRange[1])
      ) {
        return false;
      }
      if (
        (filters?.min_available_spots &&
          property.available_spots < filters.min_available_spots) ||
        (filters?.max_available_spots &&
          property.available_spots > filters.max_available_spots)
      ) {
        return false;
      }

      if (
        filters?.bedsRange &&
        (property.beds < filters.bedsRange[0] ||
          property.beds > filters.bedsRange[1])
      ) {
        return false;
      }
      if (
        (filters?.min_beds && property.beds < filters.min_beds) ||
        (filters?.max_beds && property.beds > filters.max_beds)
      ) {
        return false;
      }

      if (
        filters?.roomsRange &&
        (property.total_rooms < filters.roomsRange[0] ||
          property.total_rooms > filters.roomsRange[1])
      ) {
        return false;
      }
      if (
        (filters?.min_rooms && property.total_rooms < filters.min_rooms) ||
        (filters?.max_rooms && property.total_rooms > filters.max_rooms)
      ) {
        return false;
      }

      if (
        filters?.petsAllowed !== null &&
        filters?.petsAllowed !== undefined &&
        property.pets_allowed !== filters.petsAllowed
      ) {
        return false;
      }

      if (
        filters?.smokingAllowed !== null &&
        filters?.smokingAllowed !== undefined &&
        property.smoking_allowed !== filters.smokingAllowed
      ) {
        return false;
      }

      return true;
    });
  }
  // ADD THESE METHODS TO YOUR EXISTING PropertyService

  /**
   * Get similar properties based on area/city
   */
  getSimilarProperties(propertyId: number): Observable<Property[]> {
    return this.http
      .get<{ success: boolean; data: Property[] }>(
        `${this.apiUrl}/${propertyId}/similar`
      )
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          console.warn(
            'Failed to load similar properties, using mock data:',
            error
          );
          return of(this.getMockSimilarProperties(propertyId));
        })
      );
  }

  /**
   * Add comment to property
   */
  addComment(
    propertyId: number,
    rating: number,
    comment: string
  ): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${propertyId}/comments`, { rating, comment })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to add comment:', error);
          throw error;
        })
      );
  }

  /**
   * Mock similar properties for fallback
   */
  private getMockSimilarProperties(excludeId: number): Property[] {
    const mockProperties: Property[] = [];

    for (let i = 1; i <= 4; i++) {
      const id = excludeId + i;
      const mockProp = this.getMockProperty(id);
      mockProperties.push({
        ...mockProp,
        id,
        title: `Modern Apartment ${i} in Cairo`,
        price: 2500 + i * 400,
      });
    }

    return mockProperties;
  }
  private getMockFilters() {
    return {
      cities: [
        { id: 1, name: 'Cairo' },
        { id: 2, name: 'Alexandria' },
        { id: 3, name: 'Giza' },
      ],
      areas: [
        { id: 1, name: 'Downtown', city: { id: 1, name: 'Cairo' } },
        { id: 2, name: 'Maadi', city: { id: 1, name: 'Cairo' } },
        { id: 3, name: 'Smouha', city: { id: 2, name: 'Alexandria' } },
      ],
      universities: this.getMockUniversities(),
      accommodation_types: ['apartment', 'shared', 'private', 'studio'],
      price_ranges: [
        { min: 100, max: 300, label: '100-300' },
        { min: 300, max: 500, label: '300-500' },
        { min: 500, max: 700, label: '500-700' },
        { min: 700, max: 1000, label: '700+' },
      ],
      rooms_options: [1, 2, 3, 4, 5, 6],
      sort_options: [
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'created_at_desc', label: 'Newest First' },
        { value: 'available_spots_desc', label: 'Most Available Spots' },
      ],
    };
  }

  requestBooking(
    propertyId: number,
    bookingData: BookingRequest
  ): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(
      `${this.apiUrl}/${propertyId}/request`,
      bookingData
    );
  }
}
