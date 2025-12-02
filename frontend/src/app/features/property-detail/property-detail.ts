// src/app/components/property-detail/property-detail.component.ts

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  PropertyService,
  Property,
} from '../../core/services/property/property.service';

// PrimeNG Imports
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { RatingModule } from 'primeng/rating';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GalleriaModule,
    ButtonModule,
    TagModule,
    DividerModule,
    AvatarModule,
    RatingModule,
    TabsModule,
    CardModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './property-detail.html',
  styleUrls: ['./property-detail.css'],
})
export class PropertyDetail implements OnInit {
  // Using Angular 20 Signals for reactive state management
  property = signal<Property | null>(null);
  activeImageIndex = signal<number>(0);
  isSaved = signal<boolean>(false);

  // Computed signal for formatted price
  formattedPrice = computed(() => {
    const prop = this.property();
    return prop ? `EGP${prop.price.toLocaleString()}` : '$0';
  });

  // Computed signal for availability status
  availabilityStatus = computed(() => {
    const prop = this.property();
    if (!prop) return { label: 'Unknown', severity: 'secondary' as const };

    return prop.is_available
      ? { label: '80% occupied', severity: 'success' as const }
      : { label: 'Fully Occupied', severity: 'danger' as const };
  });

  // Galleria responsiveness options
  galleriaResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Get property ID from route parameters
    const propertyId = Number(this.route.snapshot.paramMap.get('id') || 1);
    this.loadProperty(propertyId);
  }

  /**
   * Load property data from service
   */
  private loadProperty(id: number): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.isSaved.set(data.is_saved);
        console.log('Property loaded:', data);
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.showMessage('error', 'Error', 'Failed to load property details');
      },
    });
  }

  /**
   * Toggle save/favorite status
   */
  onToggleSave(): void {
    const prop = this.property();
    if (!prop) return;

    this.propertyService.toggleSaved(prop.id).subscribe({
      next: (response) => {
        this.isSaved.set(response.saved);
        this.showMessage(
          'success',
          response.saved ? 'Saved!' : 'Removed',
          response.message
        );
      },
      error: (error) => {
        console.error('Error toggling save:', error);
        this.showMessage('error', 'Error', 'Failed to update saved status');
      },
    });
  }

  /**
   * Handle booking action
   */
  onBook(): void {
    this.showMessage('info', 'Booking', 'Booking functionality coming soon!');
  }

  /**
   * Handle 360 tour action
   */
  on360Tour(): void {
    this.showMessage('info', '360 Tour', '360° tour feature coming soon!');
  }

  /**
   * Handle schedule visit action
   */
  onScheduleVisit(): void {
    this.showMessage('info', 'Schedule Visit', 'Visit scheduling coming soon!');
  }

  /**
   * View roommate profile
   */
  viewRoommateProfile(userId: number): void {
    console.log('View profile for user:', userId);
    this.showMessage('info', 'Profile', 'Viewing roommate profile...');
  }

  /**
   * Show toast message
   */
  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 3000 });
  }

  /**
   * Format date to readable string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get star array for rating display
   */
  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }
}
