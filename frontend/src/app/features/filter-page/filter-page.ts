import { Component, OnInit, signal, computed, effect, inject } from '@angular/core'; // أضف inject
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { PropertyService } from '../../core/services/property/property.service';
import { Property, University, PropertiesListResponse } from '../../core/models/property.model';
import {environment} from '../../environments/environment';
import { Router } from '@angular/router';

interface Listing {
  id: number;
  title: string;
  location: string;
  rooms: number;
  baths: number;
  beds: number;
  gender: string;
  price: number;
  bitsIncluded: boolean;
  image: string;
  university_id?: number;
  accommodationType: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  availableSpots: number;
  area?: string;
  city?: string;
}

interface FilterState {
  university_id: number | null;
  propertyType: string | null;
  accommodation_type?: string | null;
  gender: string | null;
  gender_requirement?: string | null;
  priceRange: number[];
  studentsRange: number[];
  bedsRange: number[];
  roomsRange: number[];
  petsAllowed: boolean | null;
  smokingAllowed: boolean | null;
  city_id?: number | null;
  area_id?: number | null;
  sort_by?: string | null;
}

@Component({
  selector: 'app-filter-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SliderModule,
    SelectModule,
    ButtonModule,
    PaginatorModule,
  ],
  templateUrl: './filter-page.html',
  styleUrl: './filter-page.css',
})
export class FilterPage implements OnInit {
  private propertyService = inject(PropertyService);

  showMoreFilters = signal(false);
  isLoading = signal(false);

  filters = signal<FilterState>({
    university_id: null,
    propertyType: null,
    gender: null,
    priceRange: [100, 700],
    studentsRange: [1, 8],
    bedsRange: [1, 10],
    roomsRange: [1, 6],
    petsAllowed: null,
    smokingAllowed: null,
    city_id: null,
    area_id: null,
    sort_by: null
  });

  universities: any[] = [];
  propertyTypes = signal<any[]>([
    { label: 'Shared Apartment', value: 'SHARED' },
    { label: 'Private Accommodation', value: 'PRIVATE' },
  ]);

  cities: any[] = [];
  areas: any[] = [];

  genders = [
    { label: 'Males', value: 'Males' },
    { label: 'Females', value: 'Females' },
  ];

  booleanOptions = [
    { label: 'Any', value: null },
    { label: 'Allowed', value: true },
    { label: 'Not Allowed', value: false },
  ];

  sortOptions = [
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest First', value: 'created_at_desc' },
    { label: 'Most Available Spots', value: 'available_spots_desc' },
  ];

  currentPage = signal(1);
  rows = signal(6);
  totalRecords = signal(0);

  selectedSort: string | null = null;

  allListings = signal<Listing[]>([]);

  filteredListings = computed(() => {
    return this.allListings();
  });

  paginatedListings = computed(() => {
    return this.allListings();
  });

  constructor(private router: Router) {
    effect(() => {
    });
  }

  ngOnInit() {
    this.loadFilterOptions();
    this.loadPropertiesFromApi();
  }

  loadFilterOptions() {
    this.propertyService.getUniversities().subscribe({
      next: (universities) => {
        this.universities = universities.map(u => ({
          label: u.name,
          value: u.id,
          abbreviation: u.abbreviation
        }));
      },
      error: (error) => {
        this.universities = [
          { label: 'Cairo University', value: 1 },
          { label: 'Ain Shams University', value: 2 },
          { label: 'Alexandria University', value: 3 },
        ];
      }
    });

    this.propertyService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities.map(c => ({
          label: c.name,
          value: c.id
        }));
      },
      error: (error) => {
        this.cities = [
          { label: 'Cairo', value: 1 },
          { label: 'Alexandria', value: 2 },
          { label: 'Giza', value: 3 },
        ];
      }
    });
  }

  onCityChange(cityId: number) {
    if (cityId) {
      this.propertyService.getAreas(cityId).subscribe({
        next: (areas) => {
          this.areas = areas.map(a => ({
            label: a.name,
            value: a.id
          }));
        },
        error: (error) => {
          this.areas = [];
        }
      });
    } else {
      this.areas = [];
      this.filters.update(f => ({ ...f, area_id: null }));
    }
  }

  loadPropertiesFromApi() {
    this.isLoading.set(true);

    const apiFilters = this.prepareFiltersForApi();

    this.propertyService.filterProperties(apiFilters, this.currentPage(), this.rows())
      .subscribe({
        next: (response: PropertiesListResponse) => {
          if (response.success) {
            this.allListings.set(this.convertPropertiesToListings(response.data.data));
            this.currentPage.set(response.data.current_page);
            this.totalRecords.set(response.data.total);

            if (response.filters) {
              this.updateAvailableFilters(response.filters);
            }
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.loadListings();
        }
      });
  }

  prepareFiltersForApi(): any {
    const filters = { ...this.filters() };
    const apiFilters: any = {};

    if (filters.university_id) apiFilters.university_id = filters.university_id;
    if (filters.propertyType) apiFilters.accommodation_type = filters.propertyType;
    if (filters.gender) apiFilters.gender_requirement = filters.gender.toLowerCase();
    if (filters.city_id) apiFilters.city_id = filters.city_id;
    if (filters.area_id) apiFilters.area_id = filters.area_id;

    if (filters.petsAllowed !== null && filters.petsAllowed !== undefined) {
      apiFilters.pets_allowed = filters.petsAllowed;
    }
    if (filters.smokingAllowed !== null && filters.smokingAllowed !== undefined) {
      apiFilters.smoking_allowed = filters.smokingAllowed;
    }

    const defaultPriceRange = [100, 700];
    if (filters.priceRange &&
      (filters.priceRange[0] !== defaultPriceRange[0] ||
        filters.priceRange[1] !== defaultPriceRange[1])) {
      apiFilters.min_price = filters.priceRange[0];
      apiFilters.max_price = filters.priceRange[1];
    }

    const defaultStudentsRange = [1, 8];
    if (filters.studentsRange &&
      (filters.studentsRange[0] !== defaultStudentsRange[0] ||
        filters.studentsRange[1] !== defaultStudentsRange[1])) {
      apiFilters.min_available_spots = filters.studentsRange[0];
      apiFilters.max_available_spots = filters.studentsRange[1];
    }

    const defaultBedsRange = [1, 10];
    if (filters.bedsRange &&
      (filters.bedsRange[0] !== defaultBedsRange[0] ||
        filters.bedsRange[1] !== defaultBedsRange[1])) {
      apiFilters.min_beds = filters.bedsRange[0];
      apiFilters.max_beds = filters.bedsRange[1];
    }

    const defaultRoomsRange = [1, 6];
    if (filters.roomsRange &&
      (filters.roomsRange[0] !== defaultRoomsRange[0] ||
        filters.roomsRange[1] !== defaultRoomsRange[1])) {
      apiFilters.min_rooms = filters.roomsRange[0];
      apiFilters.max_rooms = filters.roomsRange[1];
    }

    if (this.selectedSort) {
      apiFilters.sort_by = this.selectedSort;
    }

    return apiFilters;
  }

  convertPropertiesToListings(properties: Property[]): Listing[] {
    return properties.map(property => ({
      id: property.id,
      title: property.title,
      location: `${property.area?.name || ''}, ${property.location?.city?.name || property.area?.city?.name || ''}`.trim(),
      rooms: property.total_rooms,
      baths: property.bathrooms_count,
      beds: property.beds,
      gender: this.formatGender(property.gender_requirement),
      price: parseFloat(property.price.toString()),
      bitsIncluded: property.payment_methods?.includes('electricity') || false,
      image: this.getPropertyImage(property.images?.[0]),
      university_id: property.university_id,
      accommodationType: property.accommodation_type || 'UNKNOWN',
      petsAllowed: property.pets_allowed,
      smokingAllowed: property.smoking_allowed,
      availableSpots: property.available_spots,
      area: property.area?.name,
      city: property.location?.city?.name || property.area?.city?.name
    }));
  }

  formatGender(gender: string): string {
    const genderMap: {[key: string]: string} = {
      'male': 'Males',
      'female': 'Females',
      'mixed': 'Mixed'
    };
    return genderMap[gender] || this.capitalizeFirstLetter(gender);
  }

  getPropertyImage(image: any): string {
    if (!image) return 'https://via.placeholder.com/800x600';

    if (image.url) return image.url;

    if (image.path) {
      return `${environment.imageUrl}/storage/${image.path}`;
    }

    return 'https://via.placeholder.com/800x600';
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  updateAvailableFilters(filters: any) {
    if (filters.accommodation_types) {
      this.propertyTypes.set(filters.accommodation_types.map((type: string) => ({
        label: this.formatAccommodationType(type),
        value: type
      })));
    }

    if (filters.universities && filters.universities.length > 0) {
      this.universities = filters.universities.map((u: any) => ({
        label: u.name,
        value: u.id,
        abbreviation: u.abbreviation
      }));
    } else {
      this.universities = [
        { label: 'Cairo University', value: 1 },
        { label: 'Ain Shams University', value: 2 },
        { label: 'Alexandria University', value: 3 },
      ];
    }

    if (filters.cities) {
      this.cities = filters.cities.map((c: any) => ({
        label: c.name,
        value: c.id
      }));
    }
  }

  formatAccommodationType(type: string): string {
    const typeMap: {[key: string]: string} = {
      'apartment': 'Apartment',
      'shared': 'Shared Room',
      'private': 'Private Room',
      'studio': 'Studio',
      'villa': 'Villa',
      'SHARED': 'Shared Apartment',
      'PRIVATE': 'Private Accommodation'
    };
    return typeMap[type] || type;
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadPropertiesFromApi();
  }

  updateFilter(key: keyof FilterState, value: any) {
    this.filters.update(current => ({ ...current, [key]: value }));

    if (key === 'city_id') {
      if (value) {
        this.onCityChange(value);
      } else {
        this.areas = [];
        this.filters.update(f => ({ ...f, area_id: null }));
      }
    }

    this.onFilterChange();
  }

  toggleMoreFilters() {
    this.showMoreFilters.update(value => !value);
  }

  onSortChange() {
    this.filters.update(f => ({ ...f, sort_by: this.selectedSort }));
    this.currentPage.set(1);
    this.loadPropertiesFromApi();
  }

  onPageChange(e: PaginatorState) {
    this.currentPage.set((e.page ?? 0) + 1);
    this.rows.set(e.rows ?? 6);
    this.loadPropertiesFromApi();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters() {
    this.filters.set({
      university_id: null,
      propertyType: null,
      gender: null,
      priceRange: [100, 700],
      studentsRange: [1, 8],
      bedsRange: [1, 10],
      roomsRange: [1, 6],
      petsAllowed: null,
      smokingAllowed: null,
      city_id: null,
      area_id: null,
      sort_by: null
    });

    this.selectedSort = null;
    this.currentPage.set(1);
    this.areas = [];

    this.propertyTypes.set([
      { label: 'Shared Apartment', value: 'SHARED' },
      { label: 'Private Accommodation', value: 'PRIVATE' },
    ]);

    this.loadPropertiesFromApi();
  }

  forceUpdate() {
    this.filters.update(current => ({ ...current }));
    this.loadPropertiesFromApi();
  }

  getOptionIcon(value: any): string {
    switch(value) {
      case true:
        return 'pi pi-check text-green-500';
      case false:
        return 'pi pi-times text-red-500';
      default:
        return 'pi pi-circle text-gray-500';
    }
  }

  loadListings() {
    // this.allListings = [
    //   {
    //     id: 1,
    //     title: 'Shared Apartment (2/6 spots available)',
    //     location: '7th District, Nasr City',
    //     rooms: 3,
    //     baths: 1,
    //     beds: 6,
    //     gender: 'Females',
    //     price: 200,
    //     bitsIncluded: true,
    //     image: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
    //     university_id: 1,
    //     accommodationType: 'SHARED',
    //     petsAllowed: false,
    //     smokingAllowed: false,
    //     availableSpots: 2,
    //   },
    //   {
    //     id: 2,
    //     title: 'Private Studio',
    //     location: 'Downtown, Cairo',
    //     rooms: 1,
    //     baths: 1,
    //     beds: 1,
    //     gender: 'Mixed',
    //     price: 500,
    //     bitsIncluded: true,
    //     image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
    //     university_id: 1,
    //     accommodationType: 'PRIVATE',
    //     petsAllowed: true,
    //     smokingAllowed: false,
    //     availableSpots: 1,
    //   },
    // ];

    this.totalRecords.set(this.allListings.length);
    this.currentPage.set(1);
  }

  goToDetails(id: number) {
    this.router.navigate(['/properties', id]);
  }
}
