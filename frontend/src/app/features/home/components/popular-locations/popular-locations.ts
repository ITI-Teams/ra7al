import { Component, OnInit } from '@angular/core';
import { Popularlocations } from '../../../../core/services/popularlocations';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Property {
  id: number;
  title: string;
  image: string;
  city?: string;
  rating?: number;
  bathrooms_count?: number;
  total_rooms?: number;
  beds?: number;
  price?: string;
  description?: string;
}

interface CityRating {
  name: string;
  topRating: number;
}

@Component({
  standalone: true,
  selector: 'app-popular-locations',
  templateUrl: './popular-locations.html',
  imports: [RouterLink ,  CommonModule ]
})
export class PopularLocations implements OnInit {
  popularLocations: Property[] = [];
  cities: string[] = [];
  selectedCity: string = 'All';
  topLocations: Property[] = [];

  // ⭐ Quick View
  quickViewData: Property | null = null;

  constructor(private popularLocationsService: Popularlocations) {}

  ngOnInit(): void {
    this.loadAPI();
  }

  loadAPI() {
    this.popularLocationsService.getLatestPropertiesByCity().subscribe({
      next: (response: { cities: { name: string; properties: any[] }[] }) => {

        this.popularLocations = response.cities.flatMap((city) =>
          city.properties.map((p) => ({
            ...p,
            city: city.name,
          })) as Property[]
        );

        // Get top rating per city
        const cityRatings: CityRating[] = response.cities.map((city) => ({
          name: city.name,
          topRating: Math.max(0, ...city.properties.map((p) => p.rating ?? 0)),
        }));

        // Pick top 3 cities
        const top3Cities = cityRatings
          .sort((a, b) => b.topRating - a.topRating)
          .slice(0, 3)
          .map((c) => c.name);

        this.cities = ['All', ...top3Cities];

        this.getTopLocations();
      },
      error: (err) => console.error('API Error:', err),
    });
  }

  getTopLocations() {
    const groups: Record<string, Property[]> = {};

    this.popularLocations.forEach((item) => {
      if (!groups[item.city!]) groups[item.city!] = [];
      groups[item.city!].push(item);
    });

    this.topLocations = Object.values(groups).map((group) =>
      group.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0]
    );
  }

  selectCity(city: string) {
    this.selectedCity = city;

    if (city === 'All') {
      this.getTopLocations();
    } else {
      this.topLocations = this.popularLocations
        .filter((loc) => loc.city === city)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 1);
    }
  }

  // ⭐ Quick View: Open
  openQuickView(place: Property) {
    this.quickViewData = place;
  }

  // ⭐ Quick View: Close
  closeQuickView() {
    this.quickViewData = null;
  }

  // ⭐ Go to property
  goToProperty(id: number) {
    window.location.href = `/properties/${id}`;
  }

  // ========================
  // ⭐ PAGINATION FIXED
  // ========================

  currentPage: number = 1;
  itemsPerPage: number = 8;

  get paginatedProperties() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.topLocations.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.topLocations.length / this.itemsPerPage);
  }

 goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;

    // Scroll inside the same section only
    const section = document.getElementById('popular-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }
}
