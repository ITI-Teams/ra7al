import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/authService/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  passwordVisible: boolean = false;

togglePassword() {
  this.passwordVisible = !this.passwordVisible;
}

  registerForm: any;
  isSubmitting = false;

    previewImage: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private msg: MessageService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['student', [Validators.required]],
      image: [null as File | null],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onFileChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    this.registerForm.patchValue({ image: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result; // now works
    };
    reader.readAsDataURL(file);
  }

  roles = ['student', 'owner'];
roleOpen = false;
selectedRole: string | null = null;

selectRole(role: string) {
  this.selectedRole = role;
  this.registerForm.patchValue({ role: role });
  this.roleOpen = false;
}


  submit() {
    if (this.registerForm.invalid) {
      this.msg.add({ severity: 'error', summary: 'Validation', detail: 'Please fill required fields' });
      return;
    }

    const fd = new FormData();
    fd.append('name', (this.f.name.value ?? '') as string);
    fd.append('email', (this.f.email.value ?? '') as string);
    fd.append('password', (this.f.password.value ?? '') as string);
    fd.append('role', (this.f.role.value ?? '') as string);
    if (this.f.image.value) fd.append('image', this.f.image.value as Blob);

    this.isSubmitting = true;
    this.auth.register(fd).subscribe({
      next: (res) => {
        this.auth.storeToken(res.token);
        this.auth.storeUser(res.user);
        this.msg.add({ severity: 'success', summary: 'Registered', detail: 'Account created' });
        this.isSubmitting = false;
        // redirect based on role
        if (res.user.role === 'owner') this.router.navigate(['/owner-dashboard']);
        else this.router.navigate(['/profile-student']);
      },
      error: (err) => {
        const detail = err?.error?.message || 'Registration failed';
        this.msg.add({ severity: 'error', summary: 'Register', detail });
        this.isSubmitting = false;
      },
    });
  }
}
