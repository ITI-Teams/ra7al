import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Message,
  MessageService as ApiMessageService,
} from '../../core/services/message';
@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './contactus.html',
  styleUrl: './contactus.css',
})
export class Contactus {
  contactForm: FormGroup;
  isSubmitting = false;

  contactInfo = [
    {
      icon: 'pi pi-phone',
      title: 'Phone',
      value: '(+20) 0123456789',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      darkBgColor: 'bg-purple-900/30',
      darkIconColor: 'text-purple-400',
    },
    {
      icon: 'pi pi-envelope',
      title: 'Email',
      value: 'hello@farabi.com',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      darkBgColor: 'bg-orange-900/30',
      darkIconColor: 'text-orange-400',
    },
    {
      icon: 'pi pi-map-marker',
      title: 'Location',
      value: 'Cairo, Egypt',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      darkBgColor: 'bg-green-900/30',
      darkIconColor: 'text-green-400',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private apiMessageService: ApiMessageService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly',
        life: 3000,
      });
      return;
    }

    this.isSubmitting = true;

    //  Laravel API
    const payload: Message = this.contactForm.value;

    this.apiMessageService.sendMessage(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Your message has been sent successfully!',
          life: 3000,
        });
        this.contactForm.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send message. Please try again later.',
          life: 3000,
        });
        this.isSubmitting = false;
      },
    });
  }
}
