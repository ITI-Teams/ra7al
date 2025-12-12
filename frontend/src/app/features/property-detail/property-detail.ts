// src/app/components/property-detail/property-detail.component.ts

import { Component, OnInit, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  PropertyService,
  BookingRequest,
  BookingResponse,
} from '../../core/services/property/property.service';
import { Property } from '../../core/models/property.model';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { GalleriaModule } from 'primeng/galleria';
import { RatingModule } from 'primeng/rating';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { FavouriteService } from '../../core/services/favourite/favourite-service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TagModule,
    DividerModule,
    AvatarModule,
    RatingModule,
    TabsModule,
    CardModule,
    ToastModule,
    DialogModule,
    GalleriaModule,
    TextareaModule,
    ReactiveFormsModule,
    InputNumberModule,
  ],
  providers: [MessageService],
  templateUrl: './property-detail.html',
  styleUrls: ['./property-detail.css'],
})
export class PropertyDetail implements OnInit {
  // Booking modal
  bookingDialogVisible = signal(false);
  bookingForm!: FormGroup;

  // Comment modal
  commentDialogVisible = signal(false);
  commentForm!: FormGroup;

  // Date configurations
  minDate = new Date();
  todayStr = new Date().toISOString().split('T')[0];

  // State signals
  isSubmitting = signal<boolean>(false);
  isCommentSubmitting = signal<boolean>(false);

  // Property and similar properties
  property = signal<Property | null>(null);
  similarProperties = signal<Property[]>([]);
  isSaved = signal<boolean>(false);
  currentImageIndex: number = 0; // Simple carousel index
  // Bootstrap carousel active index
  activeIndex: number = 0;
  // Galleria responsiveness options
  responsiveOptions = [
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

  get estimatedTotal() {
    const months = this.bookingForm.get('duration_months')?.value || 0;
    const price = this.property()?.price || 0;
    return months * price;
  }
  // ===== SIMPLE CAROUSEL METHODS =====
  prevImage = (): void => {
    const prop = this.property();
    const imagesLength = prop?.images?.length;

    // Explicitly check that imagesLength is defined and > 0
    if (imagesLength && imagesLength > 0) {
      this.currentImageIndex =
        this.currentImageIndex > 0
          ? this.currentImageIndex - 1
          : imagesLength - 1;
    }
  };

  nextImage = (): void => {
    const prop = this.property();
    const imagesLength = prop?.images?.length;

    // Explicitly check that imagesLength is defined and > 0
    if (imagesLength && imagesLength > 0) {
      this.currentImageIndex =
        this.currentImageIndex < imagesLength - 1
          ? this.currentImageIndex + 1
          : 0;
    }
  };

  goToImage = (index: number): void => {
    const prop = this.property();
    const imagesLength = prop?.images?.length;

    // Explicitly check that imagesLength is defined and > index
    if (imagesLength && imagesLength > index) {
      this.currentImageIndex = index;
    }
  };

  // ===== AUTO-SLIDE CAROUSEL =====
autoSlideInterval: any; // store interval reference

/** Start auto-slide with optional interval (ms) */
startAutoSlide(interval: number = 5000): void {
  this.clearAutoSlide(); // prevent multiple intervals
  this.autoSlideInterval = setInterval(() => this.nextImage(), interval);
}

/** Pause auto-slide */
pauseAutoSlide(): void {
  this.clearAutoSlide();
}

/** Resume auto-slide */
resumeAutoSlide(interval: number = 5000): void {
  this.startAutoSlide(interval);
}

/** Clear interval safely */
private clearAutoSlide(): void {
  if (this.autoSlideInterval) {
    clearInterval(this.autoSlideInterval);
    this.autoSlideInterval = null;
  }
}

  // Computed signal for formatted price
  formattedPrice = computed(() => {
    const prop = this.property();
    return prop ? `EGP${prop.price.toLocaleString()}` : 'EGP 0';
  });

  // Computed signal for availability status
  availabilityStatus = computed(() => {
    const prop = this.property();
    if (!prop) return { label: 'Unknown', severity: 'secondary' as const };

    return prop.status == 'available'
      ? { label: 'available', severity: 'success' as const }
      : { label: 'Fully Occupied', severity: 'danger' as const };
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private favouriteService: FavouriteService
  ) {}

  ngOnInit(): void {
    this.initBookingForm();
    this.initCommentForm();

    // Get property ID from route parameters
    const propertyId = Number(this.route.snapshot.paramMap.get('id') || 1);
    this.loadProperty(propertyId);
  }

  // Method to handle property data loading
  loadPropertyData(propertyData: any) {
    this.property.set(propertyData);
    this.activeIndex = 0; // Reset to first image
  }

  private initBookingForm(): void {
    this.bookingForm = this.fb.group({
      desired_start_date: [
        this.todayStr,
        [Validators.required, this.futureDateValidator],
      ],
      duration_months: [
        6,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(60),
          Validators.pattern('^[0-9]+$'),
        ],
      ],
      message: ['', [Validators.maxLength(1000)]],
    });
  }

  private initCommentForm(): void {
    this.commentForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
      ],
    });
  }

  private futureDateValidator(control: any): { [key: string]: boolean } | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  /**
   * Load property data from service
   */
  private loadProperty(id: number): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (data) => {
        this.property.set(data);
        this.isSaved.set(data.is_saved ?? false);
        console.log('Property loaded:', data);

        // Load similar properties
        this.loadSimilarProperties(id);
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.showMessage('error', 'Error', 'Failed to load property details');
      },
    });
  }

  /**
   * Load similar properties
   */
  private loadSimilarProperties(propertyId: number): void {
    this.propertyService.getSimilarProperties(propertyId).subscribe({
      next: (properties) => {
        this.similarProperties.set(properties);
        console.log('Similar properties loaded:', properties.length);
      },
      error: (error) => {
        console.error('Error loading similar properties:', error);
      },
    });
  }

  /**
   * Navigate to another property
   */
  viewProperty(propertyId: number): void {
    this.router.navigate(['/properties', propertyId]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.loadProperty(propertyId);
    });
  }

  /**
   * Toggle save/favorite status
   */
  onToggleSave(id: number): void {
    this.favouriteService.toggleFavourite(id).subscribe((res: any) => {
      this.isSaved.set(!this.isSaved()); // signal update

      const msg = res.is_favourite
        ? 'Property has been saved successfully.'
        : 'Property has been removed successfully.';

      this.messageService.add({
        severity: res.is_favourite ? 'success' : 'warn',
        summary: res.is_favourite ? 'Saved!' : 'Removed',
        detail: msg,
        life: 3000,
      });
    });
  }

  /**
   * Open booking modal
   */
  onBook(): void {
    this.bookingForm.reset({
      desired_start_date: this.todayStr,
      duration_months: 6,
      message: '',
    });
    this.bookingDialogVisible.set(true);
  }

  /**
   * Submit booking request
   */
  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.markFormGroupTouched(this.bookingForm);
      this.showMessage(
        'warn',
        'Validation Error',
        'Please fill all required fields correctly'
      );
      return;
    }

    const prop = this.property();
    if (!prop) return;

    const bookingData: BookingRequest = {
      desired_start_date: this.bookingForm.value.desired_start_date,
      duration_months: this.bookingForm.value.duration_months,
      message: this.bookingForm.value.message?.trim() || undefined,
    };

    this.isSubmitting.set(true);

    this.propertyService.requestBooking(prop.id, bookingData).subscribe({
      next: (response: BookingResponse) => {
        this.showMessage(
          'success',
          'Success!',
          response.message || 'Booking request sent successfully!'
        );
        this.bookingDialogVisible.set(false);
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Booking error:', error);
        const errorMsg =
          error.error?.message ||
          error.message ||
          'Failed to send booking request';
        this.showMessage('error', 'Error', errorMsg);
        this.isSubmitting.set(false);
      },
    });
  }

  /**
   * Open comment modal
   */
  onAddComment(): void {
    this.commentForm.reset({
      rating: 5,
      comment: '',
    });
    this.commentDialogVisible.set(true);
  }

  /**
   * Submit comment
   */
  submitComment(): void {
    if (this.commentForm.invalid) {
      this.markFormGroupTouched(this.commentForm);
      this.showMessage(
        'warn',
        'Validation Error',
        'Please fill all required fields correctly'
      );
      return;
    }

    const prop = this.property();
    if (!prop) return;

    const { rating, comment } = this.commentForm.value;
    this.isCommentSubmitting.set(true);

    this.propertyService.addComment(prop.id, rating, comment).subscribe({
      next: (response) => {
        this.showMessage(
          'success',
          'Success!',
          response.message || 'Comment added successfully!'
        );
        this.commentDialogVisible.set(false);
        this.isCommentSubmitting.set(false);

        // Reload property to get updated comments
        this.loadProperty(prop.id);
      },
      error: (error) => {
        console.error('Comment error:', error);
        const errorMsg = error.error?.message || 'Failed to add comment';
        this.showMessage('error', 'Error', errorMsg);
        this.isCommentSubmitting.set(false);
      },
    });
  }

  /**
   * Navigate to tenant profile
   */
  viewTenantProfile(tenantId: number): void {
    this.router.navigate(['/profile', tenantId]);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(formName: string, fieldName: string): boolean {
    const form = formName === 'booking' ? this.bookingForm : this.commentForm;
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(formName: string, fieldName: string): string {
    const form = formName === 'booking' ? this.bookingForm : this.commentForm;
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return 'This field is required';
    if (errors['pastDate']) return 'Date must be today or later';
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['minlength'])
      return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength'])
      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) return 'Please enter a valid number';

    return 'Invalid value';
  }

  on360Tour(): void {
    this.showMessage('info', '360 Tour', '360° tour feature coming soon!');
  }

  onScheduleVisit(): void {
    this.showMessage('info', 'Schedule Visit', 'Visit scheduling coming soon!');
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 3000 });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }
}
