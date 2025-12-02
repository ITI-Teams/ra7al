import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ApartmentService } from '../../../../core/services/apartment/apartment-service';

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

  constructor(private fb: FormBuilder, private apartmentService: ApartmentService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: [0, [Validators.required, Validators.min(0)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city_id: [1, [Validators.required, Validators.min(0)]],
      area_id: [5, [Validators.required, Validators.min(0)]],
      available_spots: [1, [Validators.required, Validators.min(1)]],
      gender_requirement: ['mixed', Validators.required],
      smoking_allowed: [false],
      pets_allowed: [false],
      total_rooms: [1, [Validators.required, Validators.min(1)]],
      available_rooms: [1, [Validators.required, Validators.min(1)]],
      bathrooms_count: [1, [Validators.required, Validators.min(1)]],
      beds: [1, [Validators.required, Validators.min(1)]],
      size: [10, [Validators.required, Validators.min(1)]],
      accommodation_type: ['apartment', Validators.required],
      university: ['', [Validators.required, Validators.minLength(5)]],
      available_from: ['', [Validators.required, this.noPastDateValidator()]],
      available_to: ['', Validators.required],
      amenities: [[]],
      contact_phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      contact_email: ['', [Validators.required, Validators.email]],
      is_negotiable: [false],
      minimum_stay_months: [1, [Validators.required, Validators.min(1)]],
      security_deposit: [0, [Validators.required, Validators.min(0)]],
      payment_methods: [[]],
      owner_id: [5, [Validators.required, Validators.min(1)]],
      furnished: [false],
      images: [[]],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Please fill all required fields correctly!');
      return;
    }

    const formData = new FormData();
    Object.keys(this.form.value).forEach(key => {
      if (key !== 'images') {
        const value = this.form.value[key];
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      }
    });
    this.selectedFiles.forEach(file => formData.append('images[]', file));

    this.apartmentService.createApartment(formData).subscribe({
      next: res => {
        alert('Apartment created successfully!');
        this.form.reset();
        this.previewImages = [];
        this.selectedFiles = [];
      },
      error: err => console.error(err)
    });
  }

  // -------------------------------
  // TOGGLE SELECTION
  // -------------------------------
  setToggle(field: string, value: boolean) {
    this.form.patchValue({ [field]: value });
  }

  toggleAmenity(event: any) {
    const id = Number(event.target.value);
    if (event.target.checked) this.amenities.push(id);
    else this.amenities = this.amenities.filter(a => a !== id);
    this.form.patchValue({ amenities: this.amenities });
  }

  togglePayment(method: string) {
    if (this.paymentMethods.includes(method)) this.paymentMethods = this.paymentMethods.filter(m => m !== method);
    else this.paymentMethods.push(method);
    this.form.patchValue({ payment_methods: this.paymentMethods });
  }

  // -------------------------------
  // IMAGE UPLOAD
  // -------------------------------
  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  handleFiles(files: File[]) {
    if (this.selectedFiles.length + files.length > 6) {
      alert('Maximum 6 images allowed.');
      return;
    }
    for (const file of files) {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.previewImages.push(reader.result as string);
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
