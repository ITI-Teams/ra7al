import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property/property.service';
import { AuthService } from '../../../../core/services/authService/auth.service';

interface CityData {
  id: number;
  name: string;
}

interface AreaData {
  id: number;
  name: string;
}

interface AmenityData {
  id: number;
  name: string;
  icon?: string;
}

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './create-property.html',
  styleUrl: './create-property.css',
})
export class CreateProperty implements OnInit {
  propertyForm: any;
  isSubmitting = false;
  previewImages: (string | ArrayBuffer)[] = [];
  selectedAmenityIds: number[] = [];
  amenitiesOpen = false;
  cityOpen = false;
  areaOpen = false;
  genderOpen = false;
  accommodationOpen = false;

  selectedCityId: number | null = null;
  selectedCityName: string | null = null;
  selectedAreaId: number | null = null;
  selectedAreaName: string | null = null;
  selectedGender: string | null = null;
  selectedAccommodation: string | null = null;
  // Server-side validation messages mapped to controls
  serverErrors: { [key: string]: string } = {};

  // Lists populated from API
  cities: CityData[] = [];
  areas: AreaData[] = [];
  amenities: AmenityData[] = [];

  genderOptions = ['male', 'female'];
  accommodationTypes = ['Studio', 'Apartment', 'Villa', 'Shared'];
  paymentMethods = ['cash', 'bank_transfer', 'vodafone_cash'];
  selectedPaymentMethods: string[] = [];


  universities: any[] = [];
  selectedUniversityId: number | null = null;
  selectedUniversityName: string | null = null;
  universityOpen = false;

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService,
    private msg: MessageService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Load cities and amenities from API
    this.propertyService.getCities().subscribe((list) => {
      this.cities = list || [];
    });

    this.propertyService.getAmenities().subscribe((list) => {
      this.amenities = list || [];
    });
    // register listeners to clear server errors when user edits fields
    this.registerControlListeners();
  }

  /**
   * Register listeners for each control to clear server-side errors when user modifies the field
   */
  registerControlListeners() {
    if (!this.propertyForm || !this.propertyForm.controls) return;

    Object.keys(this.propertyForm.controls).forEach((key) => {
      const ctrl = this.propertyForm.get(key);
      if (!ctrl || !ctrl.valueChanges) return;
      ctrl.valueChanges.subscribe(() => {
        const errors = ctrl.errors;
        if (errors && errors['server']) {
          const newErrors = { ...errors };
          delete newErrors['server'];
          // if no other errors left, clear errors, else set remaining
          if (Object.keys(newErrors).length === 0) {
            ctrl.setErrors(null);
          } else {
            ctrl.setErrors(newErrors);
          }
        }
      });
    });
  }

  initializeForm() {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      price: ['', [Validators.required, Validators.min(1)]],
      address: ['', [Validators.required]],
      city_id: ['', [Validators.required]],
      area_id: ['', [Validators.required]],
      gender_requirement: ['mixed', [Validators.required]],
      total_rooms: ['', [Validators.required, Validators.min(1)]],
      available_rooms: ['', [Validators.required, Validators.min(1) , ]],
      bathrooms_count: ['', [Validators.required, Validators.min(1)]],
      beds: ['', [Validators.required, Validators.min(1)]],
      available_spots: ['', [Validators.required, Validators.min(1)]],
      size: ['', [Validators.required, Validators.min(1)]],
      minimum_stay_months: ['1', [Validators.required, Validators.min(1)]],
      security_deposit: ['', [Validators.required, Validators.min(0)]],
      accommodation_type: ['Apartment', [Validators.required]],
      university_id: ['', [Validators.required]],
      available_from: ['', [Validators.required]],
      available_to: ['', [Validators.required]],
      smoking_allowed: [false],
      pets_allowed: [false],
      furnished: [false],
      is_negotiable: [false],
      contact_phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      contact_email: ['', [Validators.required, Validators.email]],
      images: [null as File[] | null],
      amenities: [[] as number[]],
      payment_methods: [[] as string[]],
    },
  {
    validators: [this.dateCompareValidator, this.availableCompareValidator],
  }
  );
  }

  get f() {
    return this.propertyForm.controls;
  }

dateCompareValidator(form: FormGroup) {
  const from = form.get('available_from')?.value;
  const to = form.get('available_to')?.value;

  // If either is missing ⇒ no error
  if (!from || !to) return null;

  const fromDate = new Date(from);
  const toDate = new Date(to);
  const today = new Date();
  today.setHours(0,0,0,0); // normalize

  // If invalid dates => do nothing
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return null;

  // ❌ from < today
  if (fromDate < today) {
    return { fromPastDate: true };
  }

  // ❌ to < today
  if (toDate < today) {
    return { toPastDate: true };
  }

  // ❌ to < from
  if (toDate < fromDate) {
    return { dateInvalid: true };
  }

  return null;
}

 availableCompareValidator(form: FormGroup) {
  const total = form.get('total_rooms')?.value;
  const available = form.get('available_rooms')?.value;

  if (!total || !available) return null;

  return available > total ? { availableInvalid: true } : null;
}


  onFileChange(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray: File[] = Array.from(files);
    this.propertyForm.patchValue({ images: fileArray });

    // Preview images
    this.previewImages = [];
    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImages.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  toggleAmenity(amenityId: number) {
    const index = this.selectedAmenityIds.indexOf(amenityId);
    if (index > -1) {
      this.selectedAmenityIds.splice(index, 1);
    } else {
      this.selectedAmenityIds.push(amenityId);
    }
    this.propertyForm.patchValue({ amenities: this.selectedAmenityIds });
  }

  isAmenitySelected(amenityId: number): boolean {
    return this.selectedAmenityIds.includes(amenityId);
  }

  togglePaymentMethod(method: string) {
    const index = this.selectedPaymentMethods.indexOf(method);
    if (index > -1) {
      this.selectedPaymentMethods.splice(index, 1);
    } else {
      this.selectedPaymentMethods.push(method);
    }
    this.propertyForm.patchValue({ payment_methods: this.selectedPaymentMethods });
  }

  isPaymentMethodSelected(method: string): boolean {
    return this.selectedPaymentMethods.includes(method);
  }

  selectCity(city: CityData) {
    this.selectedCityId = city.id;
    this.selectedCityName = city.name;
    this.propertyForm.patchValue({ city_id: city.id });
    this.cityOpen = false;
    // Reset area when city changes
    this.selectedAreaId = null;
    this.selectedAreaName = null;
    this.propertyForm.patchValue({ area_id: '' });
    // Reset University when city changes
    this.selectedUniversityId = null;
    this.selectedUniversityName = null;
    this.propertyForm.patchValue({ university_id: '' });

    // fetch areas for selected city
    this.propertyService.getAreas(city.id).subscribe((list) => {
      this.areas = list || [];
    });
    // fetch University for selected city
    this.propertyService.getUniversitiesByCity(city.id).subscribe((list) => {
      this.universities = list || [];
    });
  }

  selectUniversity(university: any) {
    this.selectedUniversityId = university.id;
    this.selectedUniversityName = university.name;
    this.propertyForm.patchValue({ university_id: university.id });
    this.universityOpen = false;
  }

  selectArea(area: AreaData) {
    this.selectedAreaId = area.id;
    this.selectedAreaName = area.name;
    this.propertyForm.patchValue({ area_id: area.id });
    this.areaOpen = false;
  }

  selectGender(gender: string) {
    this.selectedGender = gender;
    this.propertyForm.patchValue({ gender_requirement: gender });
    this.genderOpen = false;
  }

  selectAccommodation(accommodation: string) {
    this.selectedAccommodation = accommodation;
    this.propertyForm.patchValue({ accommodation_type: accommodation });
    this.accommodationOpen = false;
  }

  getAreaOptions(): AreaData[] {
    return this.areas;
  }

  onUniversitySelect(university: any) {
    this.propertyForm.patchValue({
      university_id: university.id
    });

    this.selectedUniversityId = university.id;
  }

  submit() {
    if (this.propertyForm.invalid) {
      this.msg.add({ severity: 'error', summary: 'Validation', detail: 'Please fill all required fields' });
      return;
    }

    const formData = new FormData();
    const user = this.authService.getUser();

    // Add all form fields
    const formValue = this.propertyForm.value;

    // Add required fields
    formData.append('title', formValue.title);
    formData.append('description', formValue.description);
    formData.append('price', formValue.price);
    formData.append('address', formValue.address);
    formData.append('city_id', formValue.city_id);
    formData.append('area_id', formValue.area_id);
    formData.append('gender_requirement', formValue.gender_requirement);
    formData.append('total_rooms', formValue.total_rooms);
    formData.append('available_rooms', formValue.available_rooms);
    formData.append('bathrooms_count', formValue.bathrooms_count);
    formData.append('beds', formValue.beds);
    formData.append('available_spots', formValue.available_spots);
    formData.append('size', formValue.size);
    formData.append('accommodation_type', formValue.accommodation_type);
    formData.append(
      'university_id',
      this.selectedUniversityId?.toString() || formValue.university_id
    );
    formData.append('available_from', formValue.available_from);
    formData.append('available_to', formValue.available_to);
    formData.append('smoking_allowed', formValue.smoking_allowed ? '1' : '0');
    formData.append('pets_allowed', formValue.pets_allowed ? '1' : '0');
    formData.append('furnished', formValue.furnished ? '1' : '0');
    formData.append('owner_id', user?.id || '');

    // Add payment methods
    if (formValue.payment_methods && formValue.payment_methods.length > 0) {
      formValue.payment_methods.forEach((method: string) => {
        formData.append('payment_methods[]', method);
      });
    }

    // Add amenities as array
    if (formValue.amenities && formValue.amenities.length > 0) {
      formValue.amenities.forEach((amenityId: number) => {
        formData.append('amenities[]', amenityId.toString());
      });
    }

    // Add images
    if (formValue.images && formValue.images.length > 0) {
      formValue.images.forEach((file: File) => {
        formData.append('images[]', file);
      });
    }

    this.isSubmitting = true;
    this.propertyService.createProperty(formData).subscribe({
      next: (res) => {
        this.msg.add({ severity: 'success', summary: 'Success', detail: 'Property created successfully' });
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/owner-dashboard']);
        }, 2000);
      },
      error: (err) => {
        // Clear previous server errors
        this.serverErrors = {};

        if (err?.error?.errors && typeof err.error.errors === 'object') {
          const errors = err.error.errors as { [key: string]: string[] };

          // Map dotted keys (e.g., amenities.0) to parent control keys (amenities)
          Object.keys(errors).forEach((key) => {
            const parts = key.split('.');
            const controlKey = parts[0];
            const message = errors[key].join(' ');
            this.serverErrors[controlKey] = message;

            const ctrl = this.propertyForm.get(controlKey);
            if (ctrl) {
              // set a 'server' error with the message
              ctrl.setErrors({ server: message });
            }
          });

          // show toast with first message
          const firstField = Object.keys(errors)[0];
          const firstMsg = errors[firstField][0];
          this.msg.add({ severity: 'error', summary: 'Validation error', detail: firstMsg });
        } else {
          const detail = err?.error?.message || 'Failed to create property';
          this.msg.add({ severity: 'error', summary: 'Error', detail });
        }

        console.error('Error response:', err);
        this.isSubmitting = false;
      },
    });
  }

  removeImage(index: number) {
    const currentFiles = this.f.images.value as File[];
    if (currentFiles) {
      currentFiles.splice(index, 1);
      this.propertyForm.patchValue({ images: currentFiles });
      this.previewImages.splice(index, 1);
    }
  }
}
