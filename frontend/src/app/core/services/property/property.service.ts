// src/app/services/property.service.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PropertyImage {
  id: number;
  path: string;
  priority: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

export interface Area {
  id: number;
  name: string;
  city: {
    id: number;
    name: string;
  };
}

export interface Owner {
  id: number;
  name: string;
  avatar: string;
  phone: string;
}

export interface Comment {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

export interface Bill {
  id: number;
  name: string;
  icon?: string;
}

export interface Roommate {
  id: number;
  name: string;
  avatar: string;
  university: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  gender_requirement: 'male' | 'female' | 'mixed';
  smoking_allowed: boolean;
  rooms_count: number;
  bathrooms_count: number;
  size: number;
  available_from: string;
  status: string;
  area: Area;
  owner: Owner;
  images: PropertyImage[];
  primary_image: string;
  amenities: Amenity[];
  bills: Bill[];
  roommates: Roommate[];
  average_rating: number;
  is_available: boolean;
  is_saved: boolean;
  comments: Comment[];
  created_at: string;
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

    return this.http.get<{ data: Property }>(`${this.apiUrl}/${id}`).pipe(
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
        catchError(() => {
          // Mock response for fallback
          return of({ saved: true, message: 'Property saved successfully' });
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
      rooms_count: 3,
      bathrooms_count: 2,
      size: 75,
      available_from: '2025-08-26',
      status: 'available',
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
      },
      images: [
        {
          id: 1,
          path: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          priority: 1,
        },
        {
          id: 2,
          path: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          priority: 2,
        },
        {
          id: 3,
          path: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          priority: 3,
        },
        {
          id: 4,
          path: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
          priority: 4,
        },
      ],
      primary_image:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      amenities: [
        { id: 1, name: 'AC', icon: 'pi pi-sun' },
        { id: 2, name: 'Electricity', icon: 'pi pi-bolt' },
        { id: 3, name: 'Water', icon: 'pi pi-droplet' },
        { id: 4, name: 'Fridge', icon: 'pi pi-box' },
        { id: 5, name: 'Microwave', icon: 'pi pi-box' },
        { id: 6, name: 'Smart TV', icon: 'pi pi-desktop' },
        { id: 7, name: 'Wash machine', icon: 'pi pi-replay' },
      ],
      bills: [
        { id: 1, name: 'Electricity', icon: 'pi pi-bolt' },
        { id: 2, name: 'Water', icon: 'pi pi-droplet' },
        { id: 3, name: 'Internet', icon: 'pi pi-wifi' },
      ],
      roommates: [
        {
          id: 1,
          name: 'Mohamed Salah',
          avatar: 'https://i.pravatar.cc/150?img=5',
          university: 'Cairo University',
        },
        {
          id: 2,
          name: 'Ali Ahmed',
          avatar: 'https://i.pravatar.cc/150?img=8',
          university: 'Ain Shams University',
        },
      ],
      average_rating: 4.8,
      is_available: true,
      is_saved: false,
      comments: [
        {
          id: 1,
          user: {
            id: 2,
            name: 'Mohamed Ahmed',
            avatar: 'https://i.pravatar.cc/150?img=33',
          },
          rating: 5,
          comment:
            "Experience was amazing! I'm going to Plymouth College of Art. Great place & they are best students are negotiate ride on as of student! No better offers the website design - it's user, clean & well organized.",
          created_at: 'April 5, 2025',
        },
        {
          id: 2,
          user: {
            id: 3,
            name: 'Mohamed Ahmed',
            avatar: 'https://i.pravatar.cc/150?img=68',
          },
          rating: 5,
          comment:
            "Experience was amazing! I'm going to Plymouth College of Art. Great place & they are best students are negotiate ride on as of student! No better offers the website design - it's user, clean & well organized.",
          created_at: 'April 5, 2025',
        },
      ],
      created_at: '2025-01-15T10:00:00Z',
    };
  }
}
