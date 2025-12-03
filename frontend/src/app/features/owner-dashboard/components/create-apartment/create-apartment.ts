import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ApartmentService } from '../../../../core/services/apartment/apartment-service';
import { AuthService } from '../../../../core/services/authService/auth.service';

@Component({
  selector: 'app-create-apartment',
  standalone: true,
  templateUrl: './create-apartment.html',
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateApartment {

  form: FormGroup;

  amenities: number[] = [];
  paymentMethods: string[] = [];

  previewImages: string[] = [];
  selectedFiles: File[] = [];

  paymentOptions = [
    { id: 'cash', icon: '💵', label: 'Cash' },
    { id: 'bank_transfer', icon: '🏦', label: 'Bank Transfer' },
    { id: 'vodafone_cash', icon: '📱', label: 'Vodafone Cash' },
  ];

  constructor(private fb: FormBuilder, private apartmentService: ApartmentService, private authService: AuthService) {
 this.form = this.fb.group({
  owner_id: [null, [Validators.required, Validators.min(1)]],
  city_id: [null, [Validators.required, Validators.min(1)]],
  area_id: [null, [Validators.required, Validators.min(1)]],

  title: ['', [Validators.required, Validators.minLength(5)]],
  description: ['', [Validators.required, Validators.minLength(5)]],
  price: [null, [Validators.required, Validators.min(1)]],
  address: ['', [Validators.required, Validators.minLength(5)]],

  gender_requirement: ['mixed', Validators.required],
  smoking_allowed: [false, Validators.required],
  pets_allowed: [false, Validators.required],

  total_rooms: [1, [Validators.required, Validators.min(1)]],
  available_rooms: [1, [Validators.required, Validators.min(1)]],
  bathrooms_count: [1, [Validators.required, Validators.min(1)]],
  beds: [1, [Validators.required, Validators.min(1)]],
  available_spots: [1, [Validators.required, Validators.min(1)]],

  size: [null, Validators.min(1)],
  accommodation_type: ['apartment'],
  university: [''],

  available_from: ['', [Validators.required, this.noPastDateValidator()]],
  available_to: [''],

  status: ['available', Validators.required],

  // العلاقات
  amenities: [[], Validators.required],
  payment_methods: [[], Validators.required],
  images: [[], Validators.required],     // property_images table
}, { validators: this.dateRangeValidator('available_from', 'available_to') });


  }

  // -------------------------------
  // CUSTOM VALIDATORS
  // -------------------------------
  noPastDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0,0,0,0);
      return selectedDate < today ? { pastDate: true } : null;
    };
  }

  dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
    return (group: AbstractControl) => {
      const start = group.get(startKey)?.value;
      const end = group.get(endKey)?.value;
      if (!start || !end) return null;
      return new Date(end) < new Date(start) ? { invalidRange: true } : null;
    };
  }

  // -------------------------------
  // SUBMIT FORM
  // -------------------------------
submitForm() {
  this.form.markAllAsTouched();

  if (this.form.invalid) {
    alert("Please fill all required fields!");
    return;
  }

  const formData = new FormData();

  // --- OWNER ID (من المستخدم المسجل) ---
  try {
    const u = this.authService.getUser();
    if (u && !this.form.value.owner_id) {
      this.form.patchValue({ owner_id: Number(u.id) });
    }
  } catch {}

  // --- إضافة جميع الحقول (ما عدا الصور) ---
  Object.keys(this.form.value).forEach(key => {
    if (key === 'images') return;

    const value = this.form.value[key];

    if (value === null || value === '' || value === undefined) return;

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  // --- إضافة الصور ---
  this.selectedFiles.forEach(file => {
    formData.append("images[]", file);
  });

  // --- إرسال API ---
  this.apartmentService.createApartment(formData).subscribe({
    next: (res) => {
      alert("Property Created Successfully!");
      this.form.reset();
      this.selectedFiles = [];
      this.previewImages = [];
    },
    error: (err) => {
      console.error(err);

      const backendErrors = err?.error?.errors;

      if (backendErrors) {
        const firstField = Object.keys(backendErrors)[0];
        const firstMsg = backendErrors[firstField][0];

        // attach backend validation to form
        Object.keys(backendErrors).forEach(field => {
          const control = this.form.get(field);
          if (control) control.setErrors({ server: backendErrors[field][0] });
        });

        alert(firstMsg);
      } else {
        alert("Error creating property!");
      }
    }
  });
}



  // -------------------------------
  // TOGGLE SELECTIONS
  // -------------------------------
  setToggle(field: string, value: boolean) {
    this.form.patchValue({ [field]: value });
  }

  toggleAmenity(event: any) {
    const id = Number(event.target.value);

    if (event.target.checked) {
      if (!this.amenities.includes(id)) this.amenities.push(id);
    } else {
      this.amenities = this.amenities.filter(a => a !== id);
    }

    this.form.patchValue({ amenities: [...this.amenities] });
  }

  togglePayment(method: string) {
    if (this.paymentMethods.includes(method)) {
      this.paymentMethods = this.paymentMethods.filter(m => m !== method);
    } else {
      this.paymentMethods.push(method);
    }

    this.form.patchValue({ payment_methods: [...this.paymentMethods] });
  }

  // -------------------------------
  // IMAGE UPLOAD
  // -------------------------------
  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  handleFiles(files: File[]) {
    for (const file of files) {

      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed.');
        continue;
      }

      if (this.selectedFiles.length >= 6) {
        alert('Maximum 6 images allowed.');
        break;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImages.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    this.form.patchValue({ images: this.selectedFiles });
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
    this.form.patchValue({ images: this.selectedFiles });
  }
}
