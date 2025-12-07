import { Component, OnInit } from '@angular/core';
import { Popularlocations } from '../../../../core/services/popularlocations';

@Component({
  standalone: true,
  selector: 'app-popular-locations',
  templateUrl: './popular-locations.html',
})
export class PopularLocations implements OnInit {
  popularLocations: any[] = []; // All properties from API
  cities: string[] = []; // Cities for filter dropdown
  selectedCity: string = 'All'; // Default selection
  topLocations: any[] = []; // Top-rated locations to display

  constructor(private popularLocationsService: Popularlocations) {}

  ngOnInit(): void {
    this.loadAPI(); // تحميل البيانات من الـ API
  }

  // Simulated API
  loadAPI() {
    this.popularLocationsService.getLatestPropertiesByCity().subscribe({
      next: (response: any) => {
        // استلام البيانات من الـ API
        //  1) إضافة المدن من الـ API
        this.cities = ['All', ...response.cities.map((c: any) => c.name)];

        //  2) دمج كل البروبريتز في Array واحدة زي الكود القديم
        this.popularLocations = response.cities.flatMap((city: any) =>
          city.properties.map((p: any) => ({
            ...p,
            city: city.name, // مهم عشان الفلترة
          }))
        );

        //  3) تجهيز أفضل بروبرتيز لكل مدينة
        this.getTopLocations();
      },
      error: (err) => console.error('API Error:', err),
    });
  }

  // **Get top-rated apartment per city**
  getTopLocations() {
    const groups: any = {};

    this.popularLocations.forEach((item) => {
      if (!groups[item.city]) groups[item.city] = [];
      groups[item.city].push(item);
    });

    // أخد أفضل بروبرتي (حسب rating أو آخر واحدة)
    this.topLocations = Object.values(groups).map(
      (group: any) =>
        group.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))[0]
    );
  }

  // Filter by city
  selectCity(city: string) {
    this.selectedCity = city;

    if (city === 'All') {
      this.getTopLocations();
    } else {
      this.topLocations = this.popularLocations.filter(
        (loc) => loc.city === city
      );
    }
  }
}
