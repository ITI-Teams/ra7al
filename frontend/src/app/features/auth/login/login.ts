import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: any;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private msg: MessageService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['student', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  submit() {
    if (this.loginForm.invalid) {
      this.msg.add({ severity: 'error', summary: 'Validation', detail: 'Please fill required fields' });
      return;
    }

    this.isSubmitting = true;
    const payload = this.loginForm.value as { email: string; password: string; role: string };
    this.auth.login(payload).subscribe({
      next: (res) => {
        this.auth.storeToken(res.token);
        this.auth.storeUser(res.user);
        this.msg.add({ severity: 'success', summary: 'Logged in', detail: 'Welcome back' });
        this.isSubmitting = false;
        // redirect based on role
        if (res.user.role === 'owner') this.router.navigate(['/owner-dashboard']);
        else this.router.navigate(['/profile-student']);
      },
      error: (err) => {
        const detail = err?.error?.message || 'Login failed';
        this.msg.add({ severity: 'error', summary: 'Login', detail });
        this.isSubmitting = false;
      },
    });
  }
}
