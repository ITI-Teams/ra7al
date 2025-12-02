import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

  // Image upload arrays
  previewImages: string[] = [];
  selectedFiles: File[] = [];

  // Payment methods with icons
  paymentOptions = [
    { id: 'cash', icon: '💵', label: 'Cash' },
    { id: 'bank_transfer', icon: '🏦', label: 'Bank Transfer' },
    { id: 'vodafone_cash', icon: '📱', label: 'Vodafone Cash' },
  ];

  constructor(private fb: FormBuilder, private apartmentService: ApartmentService) {
    this.form = this.fb.group({
      title: [''],
      description: [''],
      price: [0],
      address: [''],
      city_id: [1],
      area_id: [5],
      available_spots: [1],
      gender_requirement: ['mixed'],
      smoking_allowed: [false],
      pets_allowed: [false],
      total_rooms: [1],
      available_rooms: [1],
      bathrooms_count: [1],
      beds: [1],
      size: [10],
      accommodation_type: ['apartment'],
      university: [''],
      available_from: [''],
      available_to: [''],
      amenities: [[]],
      contact_phone: [''],
      contact_email: [''],
      is_negotiable: [false],
      minimum_stay_months: [1],
      security_deposit: [0],
      payment_methods: [[]],
      owner_id: [5],
      furnished: [false],
      images: [[]],
    });
  }

  // -------------------------------
  // SUBMIT FORM
  // -------------------------------
  submitForm() {
    if (this.form.invalid) {
      alert('Please fill all required fields!');
      return;
    }

    const formData = new FormData();

    // نسخ كل الحقول عدا الصور
    Object.keys(this.form.value).forEach(key => {
      if (key !== 'images') {
        const value = this.form.value[key];
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    // إضافة الصور
    this.selectedFiles.forEach(file => formData.append('images[]', file));

    // إرسال البيانات عبر الـ service
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
    if (event.target.checked) {
      this.amenities.push(id);
    } else {
      this.amenities = this.amenities.filter(a => a !== id);
    }
    this.form.patchValue({ amenities: this.amenities });
  }

  togglePayment(method: string) {
    if (this.paymentMethods.includes(method)) {
      this.paymentMethods = this.paymentMethods.filter(m => m !== method);
    } else {
      this.paymentMethods.push(method);
    }
    this.form.patchValue({ payment_methods: this.paymentMethods });
  }

  // -------------------------------
  // IMAGE UPLOAD HANDLING
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
