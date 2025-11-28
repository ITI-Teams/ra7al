import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG v20
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';

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
  city: string;
  area: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    PaginatorModule,
    InputTextModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {

  // Search signal
  searchQuery = signal('');

  // Sort signal
  selectedSort = signal<string | null>(null);

  // Pagination signals
  currentPage = signal(1);
  rows = signal(9);

  // Data
  allListings: Listing[] = [];

  // Computed signals
  filteredListings = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return this.allListings;
    }

    return this.allListings.filter(item =>
      item.university.toLowerCase().includes(query) ||
      item.city.toLowerCase().includes(query) ||
      item.area.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query)
    );
  });

  sortedListings = computed(() => {
    const list = [...this.filteredListings()];
    const sortBy = this.selectedSort();

    if (sortBy === 'price_asc') {
      const sorted = list.sort((a, b) => a.price - b.price);
      return sorted;
    } else if (sortBy === 'price_desc') {
      const sorted = list.sort((a, b) => b.price - a.price);
      return sorted;
    } else if (sortBy === 'available_desc') {
      return list.sort((a, b) => b.availableSpots - a.availableSpots);
    }

    return list;
  });

  paginatedListings = computed(() => {
    const start = (this.currentPage() - 1) * this.rows();
    const end = start + this.rows();
    return this.sortedListings().slice(start, end);
  });

  totalRecords = computed(() => this.filteredListings().length);

  sortOptions = [
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Most Available', value: 'available_desc' },
    { label: 'Newest First', value: 'newest' },
  ];

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.allListings = [
      {
        title: 'Luxury Shared Apartment near Campus',
        location: '7th District, Nasr City',
        rooms: 3,
        baths: 2,
        beds: 6,
        gender: 'Females',
        price: 220,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
        university: 'Cairo University',
        accommodationType: 'SHARED',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 3,
        city: 'Cairo',
        area: 'Nasr City'
      },
      {
        title: 'Private Studio Downtown',
        location: 'Downtown, Cairo',
        rooms: 1,
        baths: 1,
        beds: 1,
        gender: 'Mixed',
        price: 520,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
        university: 'Cairo University',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 1,
        city: 'Cairo',
        area: 'Downtown'
      },
      {
        title: 'Modern Shared Apartment Maadi',
        location: 'Maadi, Cairo',
        rooms: 4,
        baths: 2,
        beds: 8,
        gender: 'Males',
        price: 380,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg',
        university: 'Ain Shams University',
        accommodationType: 'SHARED',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 4,
        city: 'Cairo',
        area: 'Maadi'
      },
      {
        title: 'Villa Room Rehab City',
        location: 'Rehab, Cairo',
        rooms: 2,
        baths: 1,
        beds: 2,
        gender: 'Females',
        price: 420,
        bitsIncluded: false,
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        university: 'Alexandria University',
        accommodationType: 'PRIVATE',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 1,
        city: 'Cairo',
        area: 'Rehab'
      },
      {
        title: 'Zamalek Luxury Apartment',
        location: 'Zamalek, Cairo',
        rooms: 2,
        baths: 1,
        beds: 2,
        gender: 'Mixed',
        price: 480,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg',
        university: 'Cairo University',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: true,
        availableSpots: 1,
        city: 'Cairo',
        area: 'Zamalek'
      },
      {
        title: 'Student Dormitory Giza',
        location: 'Giza, Cairo',
        rooms: 5,
        baths: 2,
        beds: 10,
        gender: 'Males',
        price: 160,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg',
        university: 'Ain Shams University',
        accommodationType: 'SHARED',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 5,
        city: 'Giza',
        area: 'Giza'
      },
      {
        title: 'Cozy Studio Heliopolis',
        location: 'Heliopolis, Cairo',
        rooms: 1,
        baths: 1,
        beds: 1,
        gender: 'Females',
        price: 320,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
        university: 'Cairo University',
        accommodationType: 'PRIVATE',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 1,
        city: 'Cairo',
        area: 'Heliopolis'
      },
      {
        title: 'Mohandessin Shared Apartment',
        location: 'Mohandessin, Cairo',
        rooms: 4,
        baths: 2,
        beds: 6,
        gender: 'Males',
        price: 280,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/1457845/pexels-photo-1457845.jpeg',
        university: 'Ain Shams University',
        accommodationType: 'SHARED',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 2,
        city: 'Cairo',
        area: 'Mohandessin'
      },
      {
        title: 'Alexandria Sea View Apartment',
        location: 'Miami, Alexandria',
        rooms: 3,
        baths: 2,
        beds: 4,
        gender: 'Mixed',
        price: 450,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
        university: 'Alexandria University',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 1,
        city: 'Alexandria',
        area: 'Miami'
      },
      {
        title: 'Garden City Luxury Suite',
        location: 'Garden City, Cairo',
        rooms: 2,
        baths: 2,
        beds: 2,
        gender: 'Females',
        price: 550,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg',
        university: 'Cairo University',
        accommodationType: 'PRIVATE',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 1,
        city: 'Cairo',
        area: 'Garden City'
      },
      {
        title: '6 October City Villa Room',
        location: '6 October City',
        rooms: 3,
        baths: 1,
        beds: 3,
        gender: 'Males',
        price: 300,
        bitsIncluded: false,
        image: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
        university: 'Ain Shams University',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: true,
        availableSpots: 2,
        city: 'Giza',
        area: '6 October City'
      },
      {
        title: 'New Cairo Student Residence',
        location: 'New Cairo',
        rooms: 4,
        baths: 2,
        beds: 8,
        gender: 'Mixed',
        price: 350,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
        university: 'Cairo University',
        accommodationType: 'SHARED',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 3,
        city: 'Cairo',
        area: 'New Cairo'
      },
      {
        title: 'Luxor Traditional House',
        location: 'Luxor City',
        rooms: 3,
        baths: 2,
        beds: 4,
        gender: 'Mixed',
        price: 280,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/258646/pexels-photo-258646.jpeg',
        university: 'Assiut University',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 2,
        city: 'Luxor',
        area: 'Luxor City'
      },
      {
        title: 'Aswan Nile View Apartment',
        location: 'Aswan City',
        rooms: 2,
        baths: 1,
        beds: 2,
        gender: 'Females',
        price: 320,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/258644/pexels-photo-258644.jpeg',
        university: 'Aswan University',
        accommodationType: 'PRIVATE',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 1,
        city: 'Aswan',
        area: 'Aswan City'
      },
      {
        title: 'Mansoura City Center Studio',
        location: 'Mansoura City',
        rooms: 1,
        baths: 1,
        beds: 1,
        gender: 'Males',
        price: 250,
        bitsIncluded: false,
        image: 'https://images.pexels.com/photos/271625/pexels-photo-271625.jpeg',
        university: 'Mansoura University',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 1,
        city: 'Mansoura',
        area: 'Mansoura City'
      },
      {
        title: 'Tanta Student Shared House',
        location: 'Tanta City',
        rooms: 3,
        baths: 1,
        beds: 5,
        gender: 'Mixed',
        price: 180,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271626/pexels-photo-271626.jpeg',
        university: 'Tanta University',
        accommodationType: 'SHARED',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 2,
        city: 'Tanta',
        area: 'Tanta City'
      },
      {
        title: 'Port Said Sea Front Apartment',
        location: 'Port Said',
        rooms: 2,
        baths: 1,
        beds: 2,
        gender: 'Females',
        price: 380,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/258647/pexels-photo-258647.jpeg',
        university: 'Suez Canal University',
        accommodationType: 'PRIVATE',
        petsAllowed: false,
        smokingAllowed: false,
        availableSpots: 1,
        city: 'Port Said',
        area: 'Port Said'
      },
      {
        title: 'Ismailia Quiet Residence',
        location: 'Ismailia City',
        rooms: 2,
        baths: 1,
        beds: 3,
        gender: 'Males',
        price: 290,
        bitsIncluded: true,
        image: 'https://images.pexels.com/photos/271627/pexels-photo-271627.jpeg',
        university: 'Suez Canal University',
        accommodationType: 'PRIVATE',
        petsAllowed: true,
        smokingAllowed: false,
        availableSpots: 2,
        city: 'Ismailia',
        area: 'Ismailia City'
      }
    ];
  }

  onSearch() {
    this.currentPage.set(1);
  }

  onSortChange() {
    this.currentPage.set(1);
    this.forceUpdate();
  }

  onPageChange(e: PaginatorState) {
    this.currentPage.set((e.page ?? 0) + 1);
    this.rows.set(e.rows ?? 9);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }
  getTypeIcon(accommodationType: string): string {
    return accommodationType === 'SHARED' ? '👥' : '🏠';
  }

  forceUpdate() {
    this.searchQuery.update(val => val);
  }

}
