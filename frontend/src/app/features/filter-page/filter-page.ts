import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG v20
import { SliderModule } from 'primeng/slider';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';

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
    CardModule,
    DividerModule,
    PaginatorModule,
    CheckboxModule,
    InputNumberModule,
  ],
  templateUrl: './filter-page.html',
  styleUrl: './filter-page.css',
})
export class FilterPage implements OnInit{
  // Filters state
  filters = signal<FilterState>({
    university: null,
    propertyType: null,
    gender: null,
    priceRange: [100, 700],
    studentsRange: [1, 8],
    bedsRange: [1, 4],
    roomsRange: [1, 4],
    petsAllowed: null,
    smokingAllowed: null,
  });

  // Dropdown options
  universities = [
    { label: 'Cairo University', value: 'CU' },
    { label: 'Ain Shams University', value: 'ASU' },
    { label: 'Alexandria University', value: 'AU' },
  ];

  propertyTypes = [
    { label: 'Shared apartment', value: 'SHARED' },
    { label: 'Private accommodation', value: 'PRIVATE' },
  ];

  genders = [
    { label: 'Males', value: 'M' },
    { label: 'Females', value: 'F' },
  ];

  booleanOptions = [
    { label: 'Allowed', value: true },
    { label: 'Not allowed', value: false },
  ];

  // Pagination
  currentPage = 1;
  rows = 6;
  totalRecords = 0;

  // Listings data
  allListings: Listing[] = [];
  filteredListings: Listing[] = [];

  // Show more filters state
  showMoreFilters = false;

  ngOnInit() {
    this.loadListings();
    this.applyFilters();
  }

  loadListings() {
    this.allListings = [
      {
        title: 'Shared apartment (2/6 open spots)',
        location: 'Elhai elsabe, naser city',
        rooms: 3,
        baths: 1,
        beds: 6,
        gender: 'Required females',
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
        location: 'Downtown Cairo',
        rooms: 1,
        baths: 1,
        beds: 1,
        gender: 'Mixed',
        price: 500,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
        university: 'CU',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 1,
      },
    ];
    this.totalRecords = this.allListings.length;
  }

  applyFilters() {
    const currentFilters = this.filters();

    this.filteredListings = this.allListings.filter(listing => {
      // University filter
      if (currentFilters.university && listing.university !== currentFilters.university) {
        return false;
      }

      // Property type filter
      if (currentFilters.propertyType && listing.accommodationType !== currentFilters.propertyType) {
        return false;
      }

      // Gender filter
      if (currentFilters.gender) {
        const genderMap = { 'M': 'Males', 'F': 'Females' };
        if (!listing.gender.toLowerCase().includes(genderMap[currentFilters.gender as 'M' | 'F'].toLowerCase())) {
          return false;
        }
      }

      // Price filter
      if (listing.price < currentFilters.priceRange[0] || listing.price > currentFilters.priceRange[1]) {
        return false;
      }

      // Students filter (using available spots)
      if (listing.availableSpots < currentFilters.studentsRange[0] ||
        listing.availableSpots > currentFilters.studentsRange[1]) {
        return false;
      }

      // Beds filter
      if (listing.beds < currentFilters.bedsRange[0] || listing.beds > currentFilters.bedsRange[1]) {
        return false;
      }

      // Rooms filter
      if (listing.rooms < currentFilters.roomsRange[0] || listing.rooms > currentFilters.roomsRange[1]) {
        return false;
      }

      // Pets filter
      if (currentFilters.petsAllowed !== null && listing.petsAllowed !== currentFilters.petsAllowed) {
        return false;
      }

      // Smoking filter
      if (currentFilters.smokingAllowed !== null && listing.smokingAllowed !== currentFilters.smokingAllowed) {
        return false;
      }

      return true;
    });

    this.totalRecords = this.filteredListings.length;
    this.currentPage = 1;
  }

  onFilterChange() {
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    this.rows = event.rows;
  }

  resetFilters() {
    this.filters.set({
      university: null,
      propertyType: null,
      gender: null,
      priceRange: [100, 700],
      studentsRange: [1, 8],
      bedsRange: [1, 4],
      roomsRange: [1, 4],
      petsAllowed: null,
      smokingAllowed: null,
    });
    this.applyFilters();
  }

  get paginatedListings() {
    const start = (this.currentPage - 1) * this.rows;
    const end = start + this.rows;
    return this.filteredListings.slice(start, end);
  }
}
