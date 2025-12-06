// src/app/components/property-detail/property-detail.component.ts

import { Component, OnInit, signal, computed, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
import { FavouriteService } from '../../core/services/favourite/favourite-service';
import { InputNumberModule } from 'primeng/inputnumber';

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
    DialogModule,
    TextareaModule,
    ReactiveFormsModule,
    InputNumberModule,
  ],
  providers: [MessageService],
  templateUrl: './property-detail.html',
  styleUrls: ['./property-detail.css'],
})
export class PropertyDetail implements OnInit {

    @Input() propertys: any;
  // Booking modal
  bookingDialogVisible = signal(false);
  bookingForm!: FormGroup;
  // Date configurations
  minDate = new Date();
  todayStr = new Date().toISOString().split('T')[0];

  // State signals
  isSubmitting = signal<boolean>(false);

  get estimatedTotal() {
    const months = this.bookingForm.get('duration_months')?.value || 0;
    const price = this.property()?.price || 0;
    return months * price;
  }

  // Using Angular 20 Signals for reactive state management
  property = signal<Property | null>(null);
  activeIndex = 0;
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

    private favouriteService: FavouriteService,

    private propertyService: PropertyService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initBookingForm();
    // Get property ID from route parameters
    const propertyId = Number(this.route.snapshot.paramMap.get('id') || 1);
    this.loadProperty(propertyId);
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
  onToggleSave(id:number) {
    // const prop = this.property();
    // if (!prop) return;

    // this.propertyService.toggleSaved(prop.id).subscribe({
    //   next: (response) => {
    //     this.isSaved.set(response.saved);
    //     this.showMessage(
    //       'success',
    //       response.saved ? 'Saved!' : 'Removed',
    //       response.message
    //     );
    //   },
    //   error: (error) => {
    //     console.error('Error toggling save:', error);
    //     this.showMessage('error', 'Error', 'Failed to update saved status');
    //   },
//     });
// this.favouriteService.toggleFavourite(id).subscribe(() => {

//   console.log('is_favourite قبل التغيير:', this.propertys?.is_favourite);
// });
// this.favouriteService.toggleFavourite(id).subscribe((res:any) => {
//   this.propertys!.is_favourite = res.is_favourite;
// });

// this.favouriteService.toggleFavourite(id).subscribe((res: any) => {
//   // نحفظ القيمة الجديدة فورًا في signal
//   this.isSaved.set(!this.propertys?.is_favourite);

//   // نزامن propertys مع القيمة الجديدة
//   if (this.propertys) {
//     this.propertys.is_favourite = this.isSaved();
//   }

  // console يطبع القيمة بعد التغيير
//   console.log('is_favourite بعد التغيير:', this.propertys?.is_favourite);
// });

//   }

//   }


// this.favouriteService.toggleFavourite(id).subscribe((res: any) => {
//   // نحفظ القيمة الجديدة فورًا في signal
//   this.isSaved.set(!this.propertys?.is_favourite);

//   // نزامن propertys مع القيمة الجديدة
//   if (this.propertys) {
//     this.propertys.is_favourite = this.isSaved();
//   }

//   // console يطبع القيمة بعد التغيير
//   console.log('is_favourite بعد التغيير:', this.propertys?.is_favourite);
// });

 this.favouriteService.toggleFavourite(id).subscribe((res: any) => {

  this.isSaved.set(!this.propertys?.is_favourite);


  if (this.propertys) {
    this.propertys.is_favourite = this.isSaved();
  }


  console.log('is_favourite بعد التغيير:', this.propertys?.is_favourite);
});








  }




  /**
   * Handle booking action
   */
  onBook(): void {
    this.bookingForm.reset({
      desired_start_date: this.todayStr,
      duration_months: 6,
      message: '',
    });
    this.bookingDialogVisible.set(true);
  }

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
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return 'This field is required';
    if (errors['pastDate']) return 'Date must be today or later';
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Please enter a valid number';
    if (errors['maxlength'])
      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;

    return 'Invalid value';
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

  formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }
}
