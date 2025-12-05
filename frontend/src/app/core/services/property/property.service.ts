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
} from '../../models/property.model';

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

    return this.http.get<PropertyResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        this.isLoading.set(false);
        return response.data;
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn('API call failed, using mock data:', error);
        this.isLoading.set(false);
        // Return mock data as fallback
        return of(this.getMockProperty(id));
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
    this.isLoading.set(true);

    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    return this.http
      .get<PropertiesListResponse>(
        `${this.apiUrl}?${params.toString()}`
      )
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
  toggleSaved(propertyId: number): Observable<{ saved: boolean; message: string }> {
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
  deleteProperty(propertyId: number): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiUrl}/${propertyId}`)
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
    return this.http
      .get<CityResponse>(`${environment.apiUrl}/cities`)
      .pipe(
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
      rooms_count: 3,
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
          }
        },
      },
      area: {
        id: 1,
        name: 'Downtown',
        city: {
          id: 1,
          name: 'Cairo',
        }
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
}
