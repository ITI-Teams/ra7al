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
  imagesToDeleteIds: number[] = [];
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

  // Allowed gender options must match backend validation (male|female)
  genderOptions = ['male', 'female'];
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

    // Extract city and area IDs/names from multiple possible response shapes
    // Backend may return: property.city, property.area, property.city_id, property.area_id
    const cityIdFromRelation = property.city?.id || property.area?.city?.id;
    const cityId = cityIdFromRelation || property.city_id || property.location?.city?.id;
    const cityName = property.city?.name || property.location?.city?.name || property.area?.city?.name || null;

    const areaId = property.area?.id || property.area_id || property.location?.area?.id;
    const areaName = property.area?.name || property.location?.area?.name || null;

    // Set city and load related lists (areas & universities)
    if (cityId) {
      this.selectedCityId = cityId;
      this.selectedCityName = cityName || null;

      // Load areas for this city and mark selected area name when available
      this.propertyService.getAreas(cityId).subscribe((list) => {
        this.areas = list || [];
        if (areaId) {
          const found = this.areas.find(a => a.id === areaId);
          if (found) {
            this.selectedAreaId = found.id;
            this.selectedAreaName = found.name;
            // ensure form control is patched
            this.propertyForm.patchValue({ area_id: found.id });
          }
        }
      });

      // Load universities for this city and set selected name if present
      this.propertyService.getUniversitiesByCity(cityId).subscribe((list) => {
        this.universities = list || [];
        if (property.university_id || property.university?.id) {
          const uniId = property.university_id || property.university?.id || null;
          const foundUni = this.universities.find(u => u.id === uniId);
          if (foundUni) {
            this.selectedUniversityId = foundUni.id;
            this.selectedUniversityName = foundUni.name;
            this.propertyForm.patchValue({ university_id: foundUni.id });
          } else if (property.university?.name) {
            // fallback: keep id if name only
            this.selectedUniversityId = uniId;
            this.selectedUniversityName = property.university?.name || null;
            this.propertyForm.patchValue({ university_id: uniId });
          }
        }
      });
    }

    // If city wasn't available above, but area includes city info, attempt to set from area
    if (!this.selectedCityId && areaId && property.area?.city) {
      this.selectedCityId = property.area.city.id;
      this.selectedCityName = property.area.city.name;
    }

    // If area info exists independently, set it (will be overridden above if areas list found it)
    if (areaId && !this.selectedAreaId) {
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

    // Set existing images (use helper to normalize URL)
    if (property.images && Array.isArray(property.images)) {
      this.existingImages = property.images;
      const existingUrls = this.existingImages.map(img => this.getImageUrl(img)).filter(u => !!u);
      existingUrls.forEach(u => {
        console.log('Adding existing image:', u);
        this.previewImages.push(u);
      });
    }
    // Convert boolean values properly
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
      gender_requirement: property.gender_requirement || 'male',
      total_rooms: property.total_rooms ? parseInt(property.total_rooms.toString()) : '',
      available_rooms: property.available_rooms ? parseInt(property.available_rooms.toString()) : '',
      bathrooms_count: property.bathrooms_count ? parseInt(property.bathrooms_count.toString()) : '',
      beds: property.beds ? parseInt(property.beds.toString()) : '',
      available_spots: property.available_spots ? parseInt(property.available_spots.toString()) : '',
      size: property.size ? parseInt(property.size.toString()) : '',
      accommodation_type: property.accommodation_type || 'Apartment',
      university_id: property.university_id || '',
      available_from: this.formatDate(property.available_from),
      available_to: this.formatDate(property.available_to),
      smoking_allowed: smokingAllowed,
      pets_allowed: petsAllowed,
      furnished: isFurnished,
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
      gender_requirement: ['male', [Validators.required]],
      total_rooms: ['', [Validators.required, Validators.min(1)]],
      available_rooms: ['', [Validators.required, Validators.min(1)]],
      bathrooms_count: ['', [Validators.required, Validators.min(1)]],
      beds: ['', [Validators.required, Validators.min(1)]],
      available_spots: ['', [Validators.required, Validators.min(1)]],
      size: ['', [Validators.required, Validators.min(1)]],
      accommodation_type: ['Apartment', [Validators.required]],
      // university_id: ['', [Validators.required]],
      available_from: ['', [Validators.required]],
      available_to: ['', [Validators.required]],
      smoking_allowed: [false],
      pets_allowed: [false],
      furnished: [false],
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

  // Helper: compute an image URL from various backend fields
  getImageUrl(img: any): string {
    if (!img) return '';
    if (img.url) return img.url;
    if (img.path) return `${environment.imageUrl}/storage/${img.path}`;
    if (img.image_path) return `${environment.imageUrl}/storage/${img.image_path}`;
    return '';
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

  // Helper: derive URL for existing image objects from multiple possible fields
  const getExistingImageUrl = (img: any) => {
    if (!img) return '';
    if (img.url) return img.url;
    if (img.path) return `${environment.imageUrl}/storage/${img.path}`;
    if (img.image_path) return `${environment.imageUrl}/storage/${img.image_path}`;
    return '';
  };

  // 1) Add existing images (from database) in a deterministic way
  const existingUrls = (this.existingImages || [])
    .map(getExistingImageUrl)
    .filter(u => !!u);

  this.previewImages = [...existingUrls];

  // 2) Add previews for newly uploaded files (Data URLs)
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

    // Ensure form values reflect selected ids (city/area/university) before building payload
    const formValue = this.propertyForm.value;

    // Normalize numeric IDs: prefer selected values, then form values, then loaded property fallbacks
    const normalizeId = (val: any) => {
      if (val === null || val === undefined || val === '') return null;
      const n = Number(val);
      return Number.isFinite(n) && !Number.isNaN(n) ? Math.trunc(n) : null;
    };

    const cityToSend = normalizeId(this.selectedCityId ?? formValue.city_id ?? this.property?.location?.city?.id);
    const areaToSend = normalizeId(this.selectedAreaId ?? formValue.area_id ?? this.property?.area?.id);
    const uniToSend = normalizeId(this.selectedUniversityId ?? formValue.university_id ?? this.property?.university_id);

    // Patch the form controls so validations and further logic see the right values
    this.propertyForm.patchValue({ city_id: cityToSend, area_id: areaToSend, university_id: uniToSend });

    // Basic client-side guard: ensure required relation ids are present and numeric
    if (!cityToSend || !areaToSend || !uniToSend) {
      if (!cityToSend) this.propertyForm.get('city_id')?.setErrors({ required: true });
      if (!areaToSend) this.propertyForm.get('area_id')?.setErrors({ required: true });
      if (!uniToSend) this.propertyForm.get('university_id')?.setErrors({ required: true });
      this.msg.add({ severity: 'error', summary: 'Validation', detail: 'Please select City, Area and University' });
      return;
    }

    // Add all required and optional fields
    formData.append('title', formValue.title || '');
    formData.append('description', formValue.description || '');
    formData.append('price', formValue.price || '');
    formData.append('address', formValue.address || '');
    formData.append('city_id', String(cityToSend));
    formData.append('area_id', String(areaToSend));
    formData.append('gender_requirement', formValue.gender_requirement || 'mixed');
    formData.append('total_rooms', formValue.total_rooms || '');
    formData.append('available_rooms', formValue.available_rooms || '');
    formData.append('bathrooms_count', formValue.bathrooms_count || '');
    formData.append('beds', formValue.beds || '');
    formData.append('available_spots', formValue.available_spots || '');
    formData.append('size', formValue.size || '');
    formData.append('accommodation_type', formValue.accommodation_type || 'Apartment');
    // Ensure we always attach university id (may be empty string if not set)
    formData.append('university_id', String(uniToSend));
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

    // Add new images with correct field name (only append real File objects)
    if (formValue.images && formValue.images.length > 0) {
      const validFiles = (formValue.images as any[]).filter(f => f instanceof File);
      validFiles.forEach((file: File) => {
        formData.append('new_images[]', file);
      });
    }

    // Append images marked for deletion (ids)
    if (this.imagesToDeleteIds && this.imagesToDeleteIds.length > 0) {
      this.imagesToDeleteIds.forEach((id) => {
        formData.append('images_to_delete[]', String(id));
      });
    }

    // Debug: log key fields to help diagnose 422s (missing/invalid city/area/university)
    try {
      const debugPayload: any = {
        city_id: formValue.city_id || this.selectedCityId,
        area_id: formValue.area_id || this.selectedAreaId,
        university_id: this.selectedUniversityId || formValue.university_id,
        title: formValue.title,
        price: formValue.price,
      };
      console.log('Updating property payload (debug):', debugPayload);

      // log FormData entries (for development only)
      const entries: any[] = [];
      formData.forEach((value, key) => entries.push({ key, value }));
      console.log('FormData entries:', entries);
    } catch (e) {
      console.warn('Failed to enumerate FormData for debug', e);
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

          // Log full server error for debugging
          console.error('Full server error object:', err?.error || err);

          if (err?.error?.errors && typeof err.error.errors === 'object') {
            const errors = err.error.errors as { [key: string]: string[] };
            console.log('Server validation errors:', errors);

            Object.keys(errors).forEach((key) => {
              // Normalize keys like "university id" -> "university_id" and remove array/index parts
              const rawKey = key.split('.')[0];
              let controlKey = rawKey.replace(/\s+/g, '_').replace(/\[.*\]/g, '').replace(/-/g, '_');

              // If the normalized key still doesn't match, try a secondary normalization
              if (!this.propertyForm.get(controlKey)) {
                controlKey = controlKey.toLowerCase();
              }

              const message = errors[key].join(' ');
              this.serverErrors[controlKey] = message;

              const ctrl = this.propertyForm.get(controlKey);
              if (ctrl) {
                ctrl.setErrors({ server: message });
              }
            });

            // Show first validation message (if present)
            const firstErrorKey = Object.keys(errors)[0];
            const firstMsg = errors[firstErrorKey] && errors[firstErrorKey][0] ? errors[firstErrorKey][0] : 'Validation error';
            this.msg.add({ severity: 'error', summary: 'Validation error', detail: firstMsg });
          } else {
            const detail = err?.error?.message || 'Failed to update property';
            this.msg.add({ severity: 'error', summary: 'Error', detail });
          }

          this.isSubmitting = false;
        },
      });
    }
  }

  removeImage(index: number) {
    // Determine how many existing images have valid URLs (they appear first in previewImages)
    const existingUrls = (this.existingImages || []).map(img => this.getImageUrl(img)).filter(u => !!u);
    const existingCount = existingUrls.length;

    // If clicked on an existing image, remove it from existingImages; otherwise remove from new files
    if (index < existingCount) {
      // Remove the corresponding existing image object
      this.existingImages.splice(index, 1);
      // Rebuild previewImages: existing URLs + current new file previews
      const existingPreviewUrls = (this.existingImages || []).map(img => this.getImageUrl(img)).filter(u => !!u);
      const currentFiles = (this.f.images.value as File[]) || [];
      const newFilePreviews: (string | ArrayBuffer)[] = [];
      // We cannot regenerate dataURLs for new files synchronously here, so keep previous data URLs by slicing previewImages
      // Build previewImages as existingPreviewUrls + remaining new previews
      const previousNewPreviews = this.previewImages.slice(existingCount + 0);
      this.previewImages = [...existingPreviewUrls, ...previousNewPreviews];
    } else {
      // Removing a newly added file
      const fileIndex = index - existingCount;
      const currentFiles = this.f.images.value as File[];
      if (currentFiles) {
        currentFiles.splice(fileIndex, 1);
        this.propertyForm.patchValue({ images: currentFiles });
      }
      // Remove from previews
      this.previewImages.splice(index, 1);
    }
  }

  removeExistingImage(imageId: number) {
    // This would require an API endpoint to delete specific images
    // For now, remove the image object and its preview (if present)
    const idx = this.existingImages.findIndex(img => img.id === imageId);
    if (idx > -1) {
      const imgObj = this.existingImages[idx];
      const url = this.getImageUrl(imgObj);
      // remove from existingImages
      this.existingImages.splice(idx, 1);
      // track for deletion on submit
      if (imgObj && imgObj.id) this.imagesToDeleteIds.push(imgObj.id);
      // remove matching preview (first occurrence)
      const previewIndex = this.previewImages.findIndex(p => p === url);
      if (previewIndex > -1) this.previewImages.splice(previewIndex, 1);
    }
  }

  cancel() {
    this.router.navigate(['/owner-dashboard/apartments']);
  }
}
