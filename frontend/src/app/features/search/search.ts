import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertySearch } from '../../core/services/property-search';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// PrimeNG v20
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute } from '@angular/router';

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
       ProgressSpinnerModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertySearch
  ) {}
  // Search signal
  searchQuery = signal('');


  showClear = signal(false);

  dataLoaded = signal(false);

  isLoading = signal(false);

  // Sort signal
  selectedSort = signal<string | null>(null);

  // Pagination signals
  currentPage = signal(1);
  rows = signal(9);

  // Data
  allListings: Listing[] = [];
  totalRecords = signal(0);

  // Computed signals
  filteredListings = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return this.allListings;
    }

    return this.allListings.filter(
      (item) =>


    (item.university?.toLowerCase() ?? '').includes(query) ||
    (item.city?.toLowerCase() ?? '').includes(query) ||
    (item.area?.toLowerCase() ?? '').includes(query) ||
    (item.location?.toLowerCase() ?? '').includes(query) ||
    (item.title?.toLowerCase() ?? '').includes(query)
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

  // totalRecords = computed(() => this.filteredListings().length);

  sortOptions = [
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Most Available', value: 'available_desc' },
    { label: 'Newest First', value: 'newest' },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const keyword = params['keyword'] || '';
      this.searchQuery.set(keyword);
      this.currentPage.set(1);
      this.loadListings();
    });
  }

  // Load listings from API
  loadListings() {
    const keyword = this.searchQuery();
    const page = this.currentPage();
    const perPage = this.rows();

 this.isLoading.set(true);

    this.propertyService.searchProperties(keyword, page, perPage).subscribe({
      next: (res) => {
        this.allListings = res.data;
        this.totalRecords.set(res.meta?.total ?? res.data.length);
          // this.dataLoaded.set(true);

           this.isLoading.set(false);
      },
      error: (err) =>{
        console.error(err);
            // this.dataLoaded.set(true);
              this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadListings();
    this.showClear.set(false);
  }

  onSortChange() {
    this.currentPage.set(1);
    this.forceUpdate();
  }

  onPageChange(e: PaginatorState) {
    this.currentPage.set((e.page ?? 0) + 1);
    this.rows.set(e.rows ?? 9);
    this.loadListings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadListings();
     this.showClear.set(true);
  }
  getTypeIcon(accommodationType: string): string {
    return accommodationType === 'SHARED' ? '👥' : '🏠';
  }

  forceUpdate() {
    this.searchQuery.update((val) => val);
  }
}
