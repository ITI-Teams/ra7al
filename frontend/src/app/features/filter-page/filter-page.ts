import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

interface Listing {
  title: string;
  location: string;
  rooms: number;
  baths: number;
  beds: number;
  gender: string;
  price: number;
  bitsIncluded: boolean;
  image: string;
  university: string;
  accommodationType: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  availableSpots: number;
}

interface FilterState {
  university: string | null;
  propertyType: string | null;
  gender: string | null;
  priceRange: number[];
  studentsRange: number[];
  bedsRange: number[];
  roomsRange: number[];
  petsAllowed: boolean | null;
  smokingAllowed: boolean | null;
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

  showMoreFilters = signal(false);

  filters = signal<FilterState>({
    university: null,
    propertyType: null,
    gender: null,
    priceRange: [100, 700],
    studentsRange: [1, 8],
    bedsRange: [1, 10],
    roomsRange: [1, 6],
    petsAllowed: null,
    smokingAllowed: null,
  });

  universities = [
    { label: 'Cairo University', value: 'CU' },
    { label: 'Ain Shams University', value: 'ASU' },
    { label: 'Alexandria University', value: 'AU' },
  ];

  propertyTypes = [
    { label: 'Shared Apartment', value: 'SHARED' },
    { label: 'Private Accommodation', value: 'PRIVATE' },
  ];

  genders = [
    { label: 'Males', value: 'Males' },
    { label: 'Females', value: 'Females' },
    { label: 'Mixed', value: 'Mixed' },
  ];

  booleanOptions = [
    { label: 'Any', value: null },
    { label: 'Allowed', value: true },
    { label: 'Not Allowed', value: false },
  ];

  sortOptions = [
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
  ];

  currentPage = signal(1);
  rows = signal(6);

  selectedSort: string | null = null;

  allListings: Listing[] = [];

  filteredListings = computed(() => {
    const filtered = this.applyFilters(this.allListings, this.filters());
    return filtered;
  });

  sortedListings = computed(() => {
    const list = [...this.filteredListings()];

    if (this.selectedSort === 'price_asc') {
      const sorted = list.sort((a, b) => a.price - b.price);
      return sorted;
    } else if (this.selectedSort === 'price_desc') {
      const sorted = list.sort((a, b) => b.price - a.price);
      return sorted;
    }

    return list;
  });

  paginatedListings = computed(() => {
    const start = (this.currentPage() - 1) * this.rows();
    const end = start + this.rows();
    const result = this.sortedListings().slice(start, end);
    return result;
  });

  totalRecords = computed(() => this.filteredListings().length);

  constructor() {
    effect(() => {
    });
  }

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.allListings = [
      {
        title: 'Shared Apartment (2/6 spots available)',
        location: '7th District, Nasr City',
        rooms: 3,
        baths: 1,
        beds: 6,
        gender: 'Females',
        price: 200,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
        university: 'CU',
        accommodationType: 'SHARED',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 2,
      },
      {
        title: 'Private Studio',
        location: 'Downtown, Cairo',
        rooms: 1,
        baths: 1,
        beds: 1,
        gender: 'Mixed',
        price: 500,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
        university: 'CU',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 1,
      },
      {
        title: 'Luxury Shared Apartment',
        location: 'Maadi, Cairo',
        rooms: 4,
        baths: 2,
        beds: 8,
        gender: 'Males',
        price: 350,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg',
        university: 'ASU',
        accommodationType: 'SHARED',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 3,
      },
      {
        title: 'Room in Villa',
        location: 'Rehab, Cairo',
        rooms: 2,
        baths: 1,
        beds: 2,
        gender: 'Females',
        price: 400,
        bitsIncluded: false,
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        university: 'AU',
        accommodationType: 'PRIVATE',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 1,
      },
      {
        title: 'Modern Apartment',
        location: 'Zamalek, Cairo',
        rooms: 2,
        baths: 1,
        beds: 2,
        gender: 'Mixed',
        price: 450,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg',
        university: 'CU',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: true,
        availableSpots: 1,
      },
      {
        title: 'Student Dormitory',
        location: 'Giza, Cairo',
        rooms: 5,
        baths: 2,
        beds: 10,
        gender: 'Males',
        price: 180,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg',
        university: 'ASU',
        accommodationType: 'SHARED',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 4,
      },
      {
        title: 'Cozy Studio',
        location: 'Heliopolis, Cairo',
        rooms: 1,
        baths: 1,
        beds: 1,
        gender: 'Females',
        price: 300,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
        university: 'CU',
        accommodationType: 'PRIVATE',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 1,
      },
      {
        title: 'Large Shared Apartment',
        location: 'Mohandessin, Cairo',
        rooms: 4,
        baths: 2,
        beds: 6,
        gender: 'Males',
        price: 250,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
        university: 'ASU',
        accommodationType: 'SHARED',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 3,
      },
    ];
  }

  applyFilters(list: Listing[], filters: FilterState): Listing[] {

    const result = list.filter(item => {
      if (filters.university && item.university !== filters.university) {
        return false;
      }

      // Property Type
      if (filters.propertyType && item.accommodationType !== filters.propertyType) {
        return false;
      }

      // Gender
      if (filters.gender && item.gender !== filters.gender) {
        return false;
      }

      // Price Range
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
        return false;
      }

      // Students Range
      if (item.availableSpots < filters.studentsRange[0] || item.availableSpots > filters.studentsRange[1]) {
        return false;
      }

      // Beds Range
      if (item.beds < filters.bedsRange[0] || item.beds > filters.bedsRange[1]) {
        return false;
      }

      // Rooms Range
      if (item.rooms < filters.roomsRange[0] || item.rooms > filters.roomsRange[1]) {
        return false;
      }

      if (filters.petsAllowed !== null && item.petsAllowed !== filters.petsAllowed) {
        return false;
      }

      if (filters.smokingAllowed !== null && item.smokingAllowed !== filters.smokingAllowed) {
        return false;
      }
      return true;
    });
    return result;
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.forceUpdate()
  }

  updateFilter(key: keyof FilterState, value: any) {
    this.filters.update(current => ({ ...current, [key]: value }));
    this.onFilterChange();
  }

  toggleMoreFilters() {
    this.showMoreFilters.update(value => !value);
  }

  onSortChange() {
    this.currentPage.set(1);
    this.filters.update(current => ({ ...current }));
    this.forceUpdate();
  }

  onPageChange(e: PaginatorState) {
    this.currentPage.set((e.page ?? 0) + 1);
    this.rows.set(e.rows ?? 6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters() {
    this.filters.set({
      university: null,
      propertyType: null,
      gender: null,
      priceRange: [100, 700],
      studentsRange: [1, 8],
      bedsRange: [1, 10],
      roomsRange: [1, 6],
      petsAllowed: null,
      smokingAllowed: null,
    });
    this.selectedSort = null;
    this.currentPage.set(1);
  }

  forceUpdate() {
    this.filters.update(current => ({ ...current }));
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
}
