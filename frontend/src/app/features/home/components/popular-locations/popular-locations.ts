import { Component, OnInit } from '@angular/core';

interface LocationCard {
  id: number;
  city: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  image: string;

  // New fields
  beds: number;
  baths: number;
  rooms: number;
  rules: string; // "Female 2/6", etc.
}

@Component({
  selector: 'app-popular-locations',
  templateUrl: './popular-locations.html',
})
export class PopularLocations implements OnInit {

  cities = ['All', 'Cairo', 'Alex', 'Giza', 'Aswan'];
  selectedCity = 'All';

  locations: LocationCard[] = [];          // all data from API
  topLocations: LocationCard[] = [];       // best per city
  filteredLocations: LocationCard[] = [];  // filtered result

  ngOnInit(): void {
    this.loadFakeAPI();
    this.getTopLocations();
  }

  // Simulated API
  loadFakeAPI() {
    this.locations = [
      { id: 1, city: 'Cairo', title: 'Nasr City Apartment', description: 'Modern fully furnished.', price: '$200', rating: 4.9, image: 'asset/apartments/1.webp', beds: 2, baths: 1, rooms: 3, rules: 'Male 2/6' },

      { id: 2, city: 'Cairo', title: 'Maadi Residence', description: 'Near restaurants and schools.', price: '$250', rating: 4.7, image: 'asset/apartments/2.webp', beds: 3, baths: 2, rooms: 4, rules: 'Female 3/6' },

      { id: 3, city: 'Alex', title: 'Stanley View Room', description: 'Sea view apartment.', price: '$180', rating: 4.9, image: 'asset/apartments/3.webp', beds: 1, baths: 1, rooms: 2, rules: 'Mixed 1/4' },

      { id: 4, city: 'Giza', title: 'Dokki Apartment', description: 'Close to public transport.', price: '$160', rating: 4.8, image: 'asset/apartments/4.webp', beds: 2, baths: 1, rooms: 3, rules: 'Female 2/6' },

      { id: 5, city: 'Aswan', title: 'Nile House', description: 'High-class Nile view.', price: '$300', rating: 4.7, image: 'asset/apartments/2.jpg', beds: 3, baths: 2, rooms: 5, rules: 'Male 4/8' },
    ];
  }

  // **Get top-rated apartment per city**
  getTopLocations() {
    const groups: { [city: string]: LocationCard[] } = {};

    // Group by city
    this.locations.forEach(item => {
      if (!groups[item.city]) groups[item.city] = [];
      groups[item.city].push(item);
    });

    // Pick the top 1 for each city
    this.topLocations = Object.values(groups).map(group => {
      return group.sort((a, b) => b.rating - a.rating)[0];
    });

    this.filteredLocations = this.topLocations;
  }

  // Filter by city
  selectCity(city: string) {
    this.selectedCity = city;

    this.filteredLocations =
      city === 'All'
        ? this.topLocations
        : this.topLocations.filter(loc => loc.city === city);
  }
}
