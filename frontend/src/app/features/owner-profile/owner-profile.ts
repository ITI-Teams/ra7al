import { Component } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService } from '../../core/services/profile/profile-service';
// FavouriteService and rental request features removed from template
import { AuthService } from '../../core/services/authService/auth.service';
// Rental requests removed

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    NgClass,
    NgIf,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './owner-profile.html',
  styleUrls: ['./owner-profile.css'],
})
export class OwnerProfile {
  // Removed favourites/properties and rental requests UI
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast: boolean = false;

  profile: any;
  selectedAvatarFile: File | null = null;
  avatarPreview: string | null = null;

  profileForm: FormGroup;

  isEditing = false;
  user: any = null;

  constructor(
    private fb: FormBuilder,
    private profileSrv: ProfileService,
    private cdr: ChangeDetectorRef,
    // favouriteService removed
    private router: Router,
    private auth: AuthService,
    // rentalRequestService removed
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[\p{L}\s]+$/u)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6), Validators.maxLength(20)]],
      // Age is optional now; if provided it must be between 5 and 120
      age: ['', [Validators.min(5), Validators.max(120)]],
      avatar: [''],
    });

    // Subscribe to user changes
    this.auth.user$.subscribe((user) => {
      this.user = user;
    });

    // Listen to storage changes
    window.addEventListener('storage', () => {
      const user = this.auth.getUser();
      this.user = user;
    });
  }

  changeTab(tab: string) {
    // tabs removed from template
  }
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }
  ngOnInit(): void {
    this.cdr.detectChanges();
    this.loadProfile();
  }

  loadProfile() {
    this.profileSrv.getProfile().subscribe({
      next: ({ profile }) => {
        // Backend returns avatar as path: images/users/avatar/avatar_23_...jpg
        // avatarUrl() method will handle building the full URL
        if (!profile.avatar) {
          profile.avatar = undefined;
        }

        this.profile = profile;
        this.cdr.detectChanges();

        // keep profile as-is and patch minimal fields into the form
        this.profile = profile;
        this.cdr.detectChanges();

        this.profileForm.patchValue({
          name: profile.name || '',
          email: profile.email || '',
          age: profile.age ?? '',
          password: '',
        });
      },
      error: (err) => console.error(err),
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
  saveData() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showToastMessage('Please fix the errors in the form before saving.', 'error');
      return;
    }

    const raw = this.profileForm.getRawValue();

    const payload: any = {
      name: raw.name,
      email: raw.email,
      password: raw.password || undefined,
      // Backend requires an integer `age` field. Use entered value or existing profile age or fallback to 18.
      age: raw.age ? Number(raw.age) : (this.profile?.age ?? 18),
    };

    // Ensure backend-required fields exist (backend validation expects these)
    // Use existing profile values if available, otherwise provide sensible defaults
    const requiredDefaults = {
      roommate_style: 'any',
      cleanliness_level:0,
      smoking: false,
      pets: false,
      bio:  'No bio provided',
      gender:  null,
      habits:  null,
      preferences: null,
    };

    // Merge defaults into payload when missing
    (Object.keys(requiredDefaults) as Array<keyof typeof requiredDefaults>).forEach((k) => {
      if ((payload as any)[k] === undefined || (payload as any)[k] === null) {
        (payload as any)[k] = requiredDefaults[k];
      }
    });

    // If avatar file selected, send as FormData so backend can process file upload
    if (this.selectedAvatarFile) {
      const form = new FormData();
      Object.keys(payload).forEach((k) => {
        const v: any = payload[k];
        if (v === null || v === undefined) return;
        // If value is an object/array, stringify it
        form.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      });
      form.append('avatar', this.selectedAvatarFile as File);

      this.profileSrv.saveProfile(form).subscribe({
        next: (res) => {
          this.showToastMessage('Data saved successfully', 'success');
          if (res && res.profile) {
            this.profile = res.profile;

            // Update in-memory user and persist to auth service so UI reflects changes (like avatar flow)
            const updatedUser = { ...(this.user || {}), ...res.profile };
            this.user = updatedUser;
            this.auth.storeUser(updatedUser);

            this.profileForm.patchValue({ name: res.profile.name || '', email: res.profile.email || '', age: res.profile.age ?? '', password: '' });
            this.cdr.detectChanges();
          }
          this.isEditing = false;
        },
        error: (err) => {
          console.log('Error status:', err.status);
          console.log('Error body:', err.error);
          // If validation errors (422) return details, show the first message
          if (err.status === 422 && err.error && err.error.errors) {
            const firstField = Object.keys(err.error.errors)[0];
            const firstMsg = err.error.errors[firstField][0];
            this.showToastMessage(firstMsg || 'Validation failed. Please check inputs.', 'error');
          } else {
            this.showToastMessage('An error occurred while saving. Please try again.', 'error');
          }
        },
      });

      return;
    }

    this.profileSrv.saveProfile(payload).subscribe({
      next: (res) => {
        this.showToastMessage('Data saved successfully', 'success');
        if (res && res.profile) {
          this.profile = res.profile;

          const updatedUser = { ...(this.user || {}), ...res.profile };
          this.user = updatedUser;
          this.auth.storeUser(updatedUser);

          this.profileForm.patchValue({ name: res.profile.name || '', email: res.profile.email || '', age: res.profile.age ?? '', password: '' });
          this.cdr.detectChanges();
        }
        this.isEditing = false;
      },
      error: (err) => {
        console.log('Error status:', err.status);
        console.log('Error body:', err.error);
        if (err.status === 422 && err.error && err.error.errors) {
          const firstField = Object.keys(err.error.errors)[0];
          const firstMsg = err.error.errors[firstField][0];
          this.showToastMessage(firstMsg || 'Validation failed. Please check inputs.', 'error');
        } else {
          this.showToastMessage('An error occurred while saving. Please try again.', 'error');
        }
      },
    });
  }

  confirmSave() {
    // Show a confirmation modal that previews the new name/email and indicates password will be changed if provided
    const isDark = document.documentElement.classList.contains('dark');

    const name = this.profileForm.get('name')?.value || '';
    const email = this.profileForm.get('email')?.value || '';
    const pwd = this.profileForm.get('password')?.value || '';
    const pwdMasked = pwd ? '*'.repeat(Math.max(6, pwd.length)) : '(unchanged)';

    Swal.fire({
      background: isDark ? '#1f2937' : '#ffffff',
      color: isDark ? '#e5e7eb' : '#111827',
      icon: 'question',
      title: 'Update Profile?',
      html: `
        <div class="flex flex-col items-start gap-2 text-left">
          <div><strong>Name:</strong> ${name}</div>
          <div><strong>Email:</strong> ${email}</div>
          <div><strong>Password:</strong> ${pwd ? pwdMasked : '(unchanged)'}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'bg-white dark:bg-gray-900 rounded-2xl p-4',
        htmlContainer: 'dark:text-gray-300',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.saveData();
      }
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    this.selectedAvatarFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;

      // Show preview confirmation dialog
      const isDark = document.documentElement.classList.contains('dark');

      Swal.fire({
        // 🔥 Dark mode support
        background: isDark ? '#1f2937' : '#ffffff', // gray-800
        color: isDark ? '#e5e7eb' : '#111827', // gray-200 / gray-900
        iconColor: isDark ? '#fbbf24' : '#f59e0b', // amber

        title: 'Update Photo?',
        html: `
        <div class="flex flex-col items-center gap-4">
          <img src="${this.avatarPreview}" class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
          <p class="text-gray-600 dark:text-gray-300">Confirm to update your profile photo</p>
        </div>
      `,
        showCancelButton: true,
        confirmButtonText: 'Update Photo',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#6b7280',
        customClass: {
          popup: 'bg-white dark:bg-gray-900 rounded-2xl',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300',
          confirmButton: 'py-2 px-6 rounded-lg',
          cancelButton: 'py-2 px-6 rounded-lg',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.saveAvatarOnly();
        } else {
          // Reset on cancel
          this.selectedAvatarFile = null;
          this.avatarPreview = null;
          input.value = '';
        }
      });
    };
    reader.readAsDataURL(this.selectedAvatarFile);
  }

  saveAvatarOnly() {
    if (!this.selectedAvatarFile) {
      this.showToastMessage('No file selected', 'error');
      return;
    }

    this.profileSrv.uploadAvatar(this.selectedAvatarFile).subscribe({
      next: (res: any) => {
        this.showToastMessage('Photo updated successfully', 'success');

        if (res && res.profile && res.profile.avatar) {
          // Backend returns just the path: images/users/avatar/avatar_23_1702225800.jpg
          const avatarPath = res.profile.avatar;

          this.profile.avatar = avatarPath;
          this.user.avatar = avatarPath;
          this.auth.updateUserAvatar(avatarPath);
        }

        this.selectedAvatarFile = null;
        this.avatarPreview = null;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error uploading avatar:', err);
        this.showToastMessage(
          'Failed to update photo. Please try again.',
          'error'
        );
        this.selectedAvatarFile = null;
        this.avatarPreview = null;
      },
    });
  }

  avatarUrl(): string {
    if (!this.user) return '/assets/default-avatar.svg';
    if (this.user.avatar) {
      return `${this.auth.getBackendBase()}/storage/${this.user.avatar}`;
    }
    const name = (this.user.name || '').trim();
    let initials = '';
    if (name.length === 0) initials = '??';
    else {
      const parts = name.split(/\s+/).filter(Boolean);
      initials =
        parts.length === 1
          ? parts[0].slice(0, 2).toUpperCase()
          : (parts[0][0] + (parts[1][0] || '')).toUpperCase();
    }
    const bg = '#667eea';
    const fg = '#ffffff';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
      <rect width='100%' height='100%' fill='${bg}' rx='16' />
      <text x='50%' y='50%' dy='.1em' text-anchor='middle' fill='${fg}' font-family='Helvetica, Arial, sans-serif' font-size='52'>${initials}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  openAvatarModal() {
    const isDark = document.documentElement.classList.contains('dark');

    Swal.fire({
      // 🔥 Dark mode support
      background: isDark ? '#1f2937' : '#ffffff', // gray-800
      color: isDark ? '#e5e7eb' : '#111827', // gray-200 / gray-900
      iconColor: isDark ? '#fbbf24' : '#f59e0b', // amber
      html: `
      <div class="relative flex flex-col items-center">

        <!-- Floating Glow Circle -->
        <div class="absolute w-40 h-40 bg-linear-to-r from-orange-500 to-pink-500
                    rounded-full blur-2xl opacity-40 animate-glow"></div>

        <!-- Avatar -->
        <img src="${this.avatarUrl()}"
             class="relative w-40 h-40 rounded-3xl object-cover shadow-2xl border-4
                    border-white dark:border-gray-700 animate-pop" />

        <!-- Username -->
        <h2 class="mt-4 text-xl font-bold dark:text-white">${
          this.profileForm.get('name')?.value
        }</h2>

        <!-- Email -->
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
          ${this.profile?.email}
        </p>

        <!-- Upload Button -->
        <button id="changePhotoBtn"
                class="w-full mt-3 cursor-pointer py-3 rounded-xl text-white font-semibold
                       bg-linear-to-r from-orange-500 to-pink-500 shadow-lg
                       hover:scale-105 transition-all flex items-center justify-center gap-2">
          <i class="pi pi-camera"></i> Change Photo
        </button>

        <!-- Remove -->
        <button id="removeAvatarBtn"
                class="w-full mt-2 py-3 rounded-xl text-white font-semibold
                       bg-linear-to-r from-red-500 to-rose-500 shadow-lg
                       hover:scale-105 transition-all flex items-center justify-center gap-2">
          <i class="pi pi-times"></i> Remove Photo
        </button>

      </div>
    `,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup:
          'bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl animate-popupEnter',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300',
      },
      didOpen: () => {
        // Change Photo Button - Click file input
        const changePhotoBtn = document.getElementById('changePhotoBtn');
        changePhotoBtn?.addEventListener('click', () => {
          const fileInput = document.getElementById(
            'avatarInput'
          ) as HTMLInputElement;
          fileInput?.click();
        });

        // Remove Avatar Button - Confirm removal
        const removeBtn = document.getElementById('removeAvatarBtn');
        removeBtn?.addEventListener('click', () => {
          Swal.close();
          this.confirmRemoveAvatar();
        });
      },
    });
  }

  confirmRemoveAvatar() {
    const isDark = document.documentElement.classList.contains('dark');

    Swal.fire({
      // 🔥 Dark mode support
      background: isDark ? '#1f2937' : '#ffffff', // gray-800
      color: isDark ? '#e5e7eb' : '#111827', // gray-200 / gray-900
      iconColor: isDark ? '#fbbf24' : '#f59e0b', // amber
      title: 'Remove Photo?',
      text: 'Are you sure you want to remove your profile photo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-white dark:bg-gray-900 rounded-2xl',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300',
        confirmButton: 'py-2 px-6 rounded-lg',
        cancelButton: 'py-2 px-6 rounded-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeAvatarFromDatabase();
      }
    });
  }

  removeAvatarFromDatabase() {
    this.profileSrv.removeAvatar().subscribe({
      next: (res: any) => {
        this.showToastMessage('Photo removed successfully', 'success');
        this.profile.avatar = null;
        this.profileForm.patchValue({ avatar: null });
        this.avatarPreview = null;
        this.selectedAvatarFile = null;
        this.user.avatar = null;

        // Update user in localStorage
        this.auth.updateUserAvatar(null);

        this.cdr.detectChanges();

        const isDark = document.documentElement.classList.contains('dark');
      },
      error: (err: any) => {
        this.showToastMessage(
          'Failed to remove photo. Please try again.',
          'error'
        );
        console.error('Error removing avatar:', err);
      },
    });
  }
  // rental requests and related UI removed
}
