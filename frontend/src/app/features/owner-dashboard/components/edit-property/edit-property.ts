import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../../core/services/property/property.service';
import { AuthService } from '../../../../core/services/authService/auth.service';
import { Property } from '../../../../core/models/property.model';
import { environment } from '../../../../environments/environment';

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
  selector: 'app-edit-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './edit-property.html',
  styleUrl: './edit-property.css',
})
export class EditProperty implements OnInit {
  propertyForm: any;
  isSubmitting = false;
  isLoading = false;
  previewImages: (string | ArrayBuffer)[] = [];
  existingImages: any[] = [];
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
  serverErrors: { [key: string]: string } = {};

  cities: CityData[] = [];
  areas: AreaData[] = [];
  amenities: AmenityData[] = [];

  genderOptions = ['male', 'female', 'mixed'];
  accommodationTypes = ['Studio', 'Apartment', 'Villa', 'Shared'];
  paymentMethods = ['cash', 'bank_transfer', 'vodafone_cash'];
  selectedPaymentMethods: string[] = [];

  universities: any[] = [];
  selectedUniversityId: number | null = null;
  selectedUniversityName: string | null = null;
  universityOpen = false;

  propertyId: number | null = null;
  property: Property | null = null;

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService,
    private msg: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Get property ID from route
    this.route.params.subscribe(params => {
      this.propertyId = params['id'];
      console.log('Route params received:', params);
      console.log('Property ID from route:', this.propertyId);
      if (this.propertyId) {
        this.loadProperty(this.propertyId);
      }
    });

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


  loadProperty(id: number) {
    this.isLoading = true;
    console.log('Starting to load property with ID:', id);

    // Use the dedicated endpoint for owner's own properties with full details
    // This returns complete property data including nested IDs for city/area
    this.propertyService.getOwnerPropertyById(id).subscribe({
      next: (property) => {
        console.log('Property full details loaded:', property);
        if (!property || !property.id) {
          console.error('Invalid property data');
          this.msg.add({ severity: 'error', summary: 'Error', detail: 'Invalid property data' });
          this.isLoading = false;
          return;
        }
        this.property = property;
        this.populateFormWithProperty(property);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load property:', error);
        const errorMessage = error?.error?.message || 'Failed to load property';
        this.msg.add({ severity: 'error', summary: 'Error', detail: errorMessage });
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/owner-dashboard/apartments']);
        }, 2000);
      }
    });
  }

  populateFormWithProperty(property: any) {
    console.log('===============================');
    console.log('POPULATE FORM CALLED');
    console.log('Property object:', property);
    console.log('Property ID:', property?.id);
    console.log('Property title:', property?.title);
    console.log('Property keys:', Object.keys(property || {}));
    console.log('===============================');

    // Clear existing preview images before loading new ones
    this.previewImages = [];
    this.existingImages = [];

    // Extract city and area IDs from nested location structure
    const cityId = property.location?.city?.id;
    const areaId = property.location?.area?.id;
    const cityName = property.location?.city?.name;
    const areaName = property.location?.area?.name;

    // Set city and load areas
    if (cityId) {
      this.selectedCityId = cityId;
      this.selectedCityName = cityName || null;

      // Load areas for this city
      this.propertyService.getAreas(cityId).subscribe((list) => {
        this.areas = list || [];
      });

      // Load universities for this city
      this.propertyService.getUniversitiesByCity(cityId).subscribe((list) => {
        this.universities = list || [];
      });
    }

    // Set area
    if (areaId) {
      this.selectedAreaId = areaId;
      this.selectedAreaName = areaName || null;
    }

    // Set gender
    if (property.gender_requirement) {
      this.selectedGender = property.gender_requirement;
    }

    // Set accommodation
    if (property.accommodation_type) {
      this.selectedAccommodation = property.accommodation_type;
    }

    // Set university
    if (property.university_id) {
      this.selectedUniversityId = property.university_id;
    }

    // Set amenities - from property data
    if (property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0) {
      this.selectedAmenityIds = property.amenities.map((a: any) => a.id);
    }

    // Set payment methods - handle both string array and JSON
    let paymentMethods: string[] = [];
    if (property.payment_methods) {
      if (typeof property.payment_methods === 'string') {
        try {
          paymentMethods = JSON.parse(property.payment_methods);
        } catch (e) {
          paymentMethods = [];
        }
      } else if (Array.isArray(property.payment_methods)) {
        paymentMethods = property.payment_methods;
      }
    }
    this.selectedPaymentMethods = paymentMethods;

    // Set existing images
    if (property.images && Array.isArray(property.images)) {
      this.existingImages = property.images;
      property.images.forEach((img: any) => {
        // Try to get the URL from the response
        let imageUrl = img.url || '';

        // If no URL, construct it from the path using environment
        if (!imageUrl && img.path) {
          imageUrl = `${environment.imageUrl}/storage/${img.path}`;
        }

        if (imageUrl) {
          console.log('Adding existing image:', imageUrl);
          this.previewImages.push(imageUrl);
        }
      });
    }    // Convert boolean values properly
    const smokingAllowed = property.smoking_allowed === true || property.smoking_allowed === 1 || property.smoking_allowed === '1';
    const petsAllowed = property.pets_allowed === true || property.pets_allowed === 1 || property.pets_allowed === '1';
    const isFurnished = property.furnished === true || property.furnished === 1 || property.furnished === '1';

    // Reset and rebuild form with ALL REAL VALUES from the property
    this.propertyForm.reset({
      title: property.title || '',
      description: property.description || '',
      price: property.price ? parseFloat(property.price.toString()) : '',
      address: property.address || '',
      city_id: cityId || '',
      area_id: areaId || '',
      gender_requirement: property.gender_requirement || 'mixed',
      total_rooms: property.total_rooms ? parseInt(property.total_rooms.toString()) : '',
      available_rooms: property.available_rooms ? parseInt(property.available_rooms.toString()) : '',
      bathrooms_count: property.bathrooms_count ? parseInt(property.bathrooms_count.toString()) : '',
      beds: property.beds ? parseInt(property.beds.toString()) : '',
      available_spots: property.available_spots ? parseInt(property.available_spots.toString()) : '',
      size: property.size ? parseInt(property.size.toString()) : '',
      minimum_stay_months: property.minimum_stay_months ? parseInt(property.minimum_stay_months.toString()) : '',
      security_deposit: property.security_deposit ? parseFloat(property.security_deposit.toString()) : '',
      accommodation_type: property.accommodation_type || 'Apartment',
      university_id: property.university_id || '',
      available_from: this.formatDate(property.available_from),
      available_to: this.formatDate(property.available_to),
      smoking_allowed: smokingAllowed,
      pets_allowed: petsAllowed,
      furnished: isFurnished,
      contact_phone: property.owner?.phone || '',
      contact_email: property.owner?.email || '',
      amenities: this.selectedAmenityIds,
      payment_methods: this.selectedPaymentMethods,
    });

    console.log('Form reset with all values:', {
      title: property.title,
      price: property.price,
      total_rooms: property.total_rooms,
      available_rooms: property.available_rooms,
      bathrooms_count: property.bathrooms_count,
      beds: property.beds,
      available_spots: property.available_spots,
      size: property.size,
      address: property.address,
      city_id: cityId,
      area_id: areaId,
      formValues: this.propertyForm.value
    });
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
      available_rooms: ['', [Validators.required, Validators.min(1)]],
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
      contact_phone: [{value: '', disabled: true}],
      contact_email: [{value: '', disabled: true}],
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

    if (!from || !to) return null;

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return null;

    if (fromDate < today) {
      return { fromPastDate: true };
    }

    if (toDate < today) {
      return { toPastDate: true };
    }

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

  formatDate(dateString: string | null): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return `${year}-${month}-${day}`;   // <-- Angular-friendly
}


  onFileChange(event: any) {
  const files: FileList = event.target.files;
  if (!files || files.length === 0) return;

  // Convert FileList → File[]
  const fileArray = Array.from(files);

  // Update form images
  this.propertyForm.patchValue({ images: fileArray });

  // Reset preview list
  this.previewImages = [];

  // BASE URL for Laravel storage
  const BASE_URL = '/storage/';

  // 1) Add existing images (from database)
  if (this.existingImages && this.existingImages.length > 0) {
    this.existingImages.forEach(img => {
      this.previewImages.push(BASE_URL + img.image_path);
    });
  }

  // 2) Add previews for newly uploaded files
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
    this.selectedAreaId = null;
    this.selectedAreaName = null;
    this.propertyForm.patchValue({ area_id: '' });
    this.selectedUniversityId = null;
    this.selectedUniversityName = null;
    this.propertyForm.patchValue({ university_id: '' });

    this.propertyService.getAreas(city.id).subscribe((list) => {
      this.areas = list || [];
    });
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

    const formValue = this.propertyForm.value;

    // Add all required and optional fields
    formData.append('title', formValue.title || '');
    formData.append('description', formValue.description || '');
    formData.append('price', formValue.price || '');
    formData.append('address', formValue.address || '');
    formData.append('city_id', formValue.city_id || '');
    formData.append('area_id', formValue.area_id || '');
    formData.append('gender_requirement', formValue.gender_requirement || 'mixed');
    formData.append('total_rooms', formValue.total_rooms || '');
    formData.append('available_rooms', formValue.available_rooms || '');
    formData.append('bathrooms_count', formValue.bathrooms_count || '');
    formData.append('beds', formValue.beds || '');
    formData.append('available_spots', formValue.available_spots || '');
    formData.append('size', formValue.size || '');
    formData.append('minimum_stay_months', formValue.minimum_stay_months || '1');
    formData.append('security_deposit', formValue.security_deposit || '0');
    formData.append('accommodation_type', formValue.accommodation_type || 'Apartment');
    formData.append(
      'university_id',
      this.selectedUniversityId?.toString() || formValue.university_id || ''
    );
    formData.append('available_from', formValue.available_from || '');
    formData.append('available_to', formValue.available_to || '');
    formData.append('smoking_allowed', formValue.smoking_allowed ? '1' : '0');
    formData.append('pets_allowed', formValue.pets_allowed ? '1' : '0');
    formData.append('furnished', formValue.furnished ? '1' : '0');
    formData.append('_method', 'PUT');

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

    // Add new images with correct field name
    if (formValue.images && formValue.images.length > 0) {
      formValue.images.forEach((file: File) => {
        formData.append('new_images[]', file);
      });
    }

    this.isSubmitting = true;
    if (this.propertyId) {
      this.propertyService.updateProperty(this.propertyId, formData).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Success', detail: 'Property updated successfully' });
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/owner-dashboard/apartments']);
          }, 2000);
        },
        error: (err) => {
          this.serverErrors = {};

          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errors = err.error.errors as { [key: string]: string[] };

            Object.keys(errors).forEach((key) => {
              const parts = key.split('.');
              const controlKey = parts[0];
              const message = errors[key].join(' ');
              this.serverErrors[controlKey] = message;

              const ctrl = this.propertyForm.get(controlKey);
              if (ctrl) {
                ctrl.setErrors({ server: message });
              }
            });

            const firstField = Object.keys(errors)[0];
            const firstMsg = errors[firstField][0];
            this.msg.add({ severity: 'error', summary: 'Validation error', detail: firstMsg });
          } else {
            const detail = err?.error?.message || 'Failed to update property';
            this.msg.add({ severity: 'error', summary: 'Error', detail });
          }

          console.error('Error response:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  removeImage(index: number) {
    this.previewImages.splice(index, 1);
    // If this is a new image (beyond existing images count)
    if (index >= this.existingImages.length) {
      const currentFiles = this.f.images.value as File[];
      if (currentFiles) {
        currentFiles.splice(index - this.existingImages.length, 1);
        this.propertyForm.patchValue({ images: currentFiles });
      }
    }
  }

  removeExistingImage(imageId: number) {
    // This would require an API endpoint to delete specific images
    // For now, we'll just remove from the preview
    const index = this.existingImages.findIndex(img => img.id === imageId);
    if (index > -1) {
      this.existingImages.splice(index, 1);
      this.previewImages.splice(index, 1);
    }
  }

  cancel() {
    this.router.navigate(['/owner-dashboard/apartments']);
  }
}
